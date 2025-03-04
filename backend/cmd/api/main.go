package api

import (
	"context"
	"errors"
	"flag"
	"net"
	"net/http"
	"os"
	"time"

	"github.com/gobitfly/beaconchain/pkg/api"
	dataaccess "github.com/gobitfly/beaconchain/pkg/api/data_access"
	"github.com/gobitfly/beaconchain/pkg/monitoring"

	"github.com/gobitfly/beaconchain/pkg/commons/log"
	"github.com/gobitfly/beaconchain/pkg/commons/metrics"
	"github.com/gobitfly/beaconchain/pkg/commons/ratelimit"
	"github.com/gobitfly/beaconchain/pkg/commons/types"
	"github.com/gobitfly/beaconchain/pkg/commons/utils"
	"github.com/gobitfly/beaconchain/pkg/commons/version"
)

// TODO load these from config
const (
	dummyApi = false
)

func Run() {
	fs := flag.NewFlagSet("fs", flag.ExitOnError)

	configPath := fs.String("config", "", "Path to the config file, if empty string defaults will be used")
	versionFlag := fs.Bool("version", false, "Show version and exit")
	_ = fs.Parse(os.Args[2:])

	if *versionFlag {
		log.Info(version.Version)
		log.Info(version.GoVersion)
		return
	}

	cfg := &types.Config{}
	err := utils.ReadConfig(cfg, *configPath)
	if err != nil {
		log.Fatal(err, "error reading config file", 0)
	}
	utils.Config = cfg

	log.InfoWithFields(log.Fields{"config": *configPath, "version": version.Version, "commit": version.GitCommit, "chainName": utils.Config.Chain.ClConfig.ConfigName}, "starting")

	if cfg.DeploymentType != "development" {
		// enable light-weight db connection monitoring
		monitoring.Init(false)
		monitoring.Start()
	}

	var dataAccessor dataaccess.DataAccessor
	if dummyApi {
		dataAccessor = dataaccess.NewDummyService()
	} else {
		dataAccessor = dataaccess.NewDataAccessService(cfg)
		dataAccessor.StartDataAccessServices()
	}
	defer dataAccessor.Close()

	router := api.NewApiRouter(dataAccessor, cfg)
	router.Use(api.GetCorsMiddleware(cfg.CorsAllowedHosts))

	if utils.Config.Metrics.Enabled {
		router.Use(metrics.HttpMiddleware)
		go func() {
			log.Infof("serving metrics on %v", utils.Config.Metrics.Address)
			if err := metrics.Serve(utils.Config.Metrics.Address, utils.Config.Metrics.Pprof, utils.Config.Metrics.PprofExtra); err != nil {
				log.Fatal(err, "error serving metrics", 0)
			}
		}()
	}

	if cfg.Frontend.RatelimitEnabled {
		log.Infof("enabling ratelimit")
		ratelimit.Init()
		router.Use(ratelimit.HttpMiddleware)
	}

	var srv *http.Server
	go func() {
		srv = &http.Server{
			Handler:      router,
			Addr:         net.JoinHostPort(cfg.Frontend.Server.Host, cfg.Frontend.Server.Port),
			WriteTimeout: 15 * time.Second,
			ReadTimeout:  15 * time.Second,
		}
		log.Infof("serving on %s:%s", cfg.Frontend.Server.Host, cfg.Frontend.Server.Port)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatal(err, "error serving", 0)
		}
	}()

	utils.WaitForCtrlC()
	monitoring.Stop() // this will emit a clean shutdown event
	log.Info("shutting down server")
	if srv != nil {
		shutDownCtx, cancelShutDownCtx := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancelShutDownCtx()
		err = srv.Shutdown(shutDownCtx)
		if err != nil {
			log.Error(err, "error shutting down server", 0)
		} else {
			log.Info("server shut down")
		}
	}
}
