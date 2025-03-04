package typescript_converter

import (
	"flag"
	"go/ast"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"github.com/gobitfly/beaconchain/pkg/commons/log"
	"github.com/gzuidhof/tygo/tygo"
	"golang.org/x/tools/go/packages"
)

const (
	packagePath    = "github.com/gobitfly/beaconchain/pkg/api/types"
	fallbackType   = "any"
	commonFileName = "common"
	lintDisable    = "/* eslint-disable */\n"
)

// Files that should not be converted to TypeScript
var ignoredFiles = []string{"data_access", "search_types", "archiver"}

var typeMappings = map[string]string{
	"decimal.Decimal": "string /* decimal.Decimal */",
	"time.Time":       "string /* time.Time */",
}

// Expects the following flags:
// -out: Output folder for the generated TypeScript file

// Standard usage (execute in backend folder): go run cmd/main.go typescript-converter -out ../frontend/types/api

func Run() {
	var out string
	fs := flag.NewFlagSet("fs", flag.ExitOnError)
	fs.StringVar(&out, "out", "", "Output folder for the generated TypeScript file")
	_ = fs.Parse(os.Args[2:])

	if out == "" {
		log.Fatal(nil, "Output folder not provided", 0)
	}

	if !strings.HasSuffix(out, "/") {
		out += "/"
	}

	// delete everything in the output folder
	err := deleteFiles(out)
	if err != nil {
		log.Fatal(err, "Failed to delete files in output folder", 0)
	}

	// Load package
	pkgs, err := packages.Load(&packages.Config{
		Mode: packages.NeedTypes | packages.NeedSyntax,
	}, packagePath)

	if err != nil {
		log.Fatal(err, "Failed to load package", 0)
	}
	if packages.PrintErrors(pkgs) > 0 {
		log.Fatal(nil, "Failed to load package", 0)
	}

	// Find all common types
	commonTypes := getCommonTypes(pkgs)
	// Find all usages of common types
	usage := getCommonUsages(pkgs, commonTypes)

	// Generate Tygo for common.go
	tygos := []*tygo.Tygo{tygo.New(getTygoConfig(out, commonFileName, ""))}
	// Generate Tygo for each file
	for file, typesUsed := range usage {
		importStr := ""
		if len(typesUsed) > 0 {
			importStr = "import type { " + strings.Join(typesUsed, ", ") + " } from './" + commonFileName + "'\n"
		}
		tygos = append(tygos, tygo.New(getTygoConfig(out, file, importStr)))
	}

	// Generate TypeScript
	for _, tygo := range tygos {
		err := tygo.Generate()
		if err != nil {
			log.Fatal(err, "Failed to generate TypeScript", 0)
		}
	}

	log.Infof("Juhu!")
}

func deleteFiles(out string) error {
	files, err := filepath.Glob(out + "*.ts")
	if err != nil {
		return err
	}
	for _, file := range files {
		err = os.Remove(file)
		if err != nil {
			return err
		}
	}
	return nil
}

func getTygoConfig(out, file, frontmatter string) *tygo.Config {
	return &tygo.Config{
		Packages: []*tygo.PackageConfig{
			{
				Path:         packagePath,
				TypeMappings: typeMappings,
				FallbackType: fallbackType,
				IncludeFiles: []string{file + ".go"},
				OutputPath:   out + file + ".ts",
				Frontmatter:  lintDisable + frontmatter,
			},
		},
	}
}

// Parse common.go to find all common types
func getCommonTypes(pkgs []*packages.Package) map[string]bool {
	commonTypes := make(map[string]bool)
	for _, pkg := range pkgs {
		for _, file := range pkg.Syntax {
			filename := strings.TrimSuffix(filepath.Base(pkg.Fset.File(file.Pos()).Name()), ".go")
			if filepath.Base(filename) != commonFileName {
				continue
			}
			ast.Inspect(file, func(n ast.Node) bool {
				if typeSpec, ok := n.(*ast.TypeSpec); ok {
					commonTypes[typeSpec.Name.Name] = true
				}
				return true
			})
			return commonTypes
		}
	}
	return nil
}

// Parse all files to find used common types for each file
func getCommonUsages(pkgs []*packages.Package, commonTypes map[string]bool) map[string][]string {
	usage := make(map[string][]string) // Map from file to list of commonTypes used
	for _, pkg := range pkgs {
		for _, file := range pkg.Syntax {
			filename := strings.TrimSuffix(filepath.Base(pkg.Fset.File(file.Pos()).Name()), ".go")
			if filepath.Base(filename) == commonFileName || slices.Contains(ignoredFiles, filename) {
				continue
			}
			if _, exists := usage[filename]; !exists {
				usage[filename] = make([]string, 0)
			}
			ast.Inspect(file, func(n ast.Node) bool {
				ident, ok := n.(*ast.Ident)
				if !ok {
					return true
				}
				if !commonTypes[ident.Name] {
					return true
				}
				if !slices.Contains(usage[filename], ident.Name) {
					usage[filename] = append(usage[filename], ident.Name)
				}
				return true
			})
		}
	}
	return usage
}
