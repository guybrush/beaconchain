// Code generated by tygo. DO NOT EDIT.
/* eslint-disable */
import type { PeriodicValues, ClElValue, ApiDataResponse, ApiPagingResponse, StatusCount, Luck, ChartData, ValidatorHistoryDuties, Address, PubKey, Hash } from './common'

//////////
// source: validator_dashboard.go

/**
 * ------------------------------------------------------------
 * Overview
 */
export interface VDBOverviewValidators {
  online: number /* uint64 */;
  offline: number /* uint64 */;
  pending: number /* uint64 */;
  exited: number /* uint64 */;
  slashed: number /* uint64 */;
}
export interface VDBOverviewGroup {
  id: number /* uint64 */;
  name: string;
  count: number /* uint64 */;
}
export interface VDBOverviewData {
  groups: VDBOverviewGroup[];
  validators: VDBOverviewValidators;
  efficiency: PeriodicValues<number /* float64 */>;
  rewards: PeriodicValues<ClElValue<string /* decimal.Decimal */>>;
  apr: PeriodicValues<ClElValue<number /* float64 */>>;
}
export type InternalGetValidatorDashboardResponse = ApiDataResponse<VDBOverviewData>;
/**
 * ------------------------------------------------------------
 * Summary Tab
 */
export interface VDBSummaryTableRow {
  group_id: number /* uint64 */;
  efficiency: PeriodicValues<number /* float64 */>;
  validators: number /* uint64 */[];
}
export type InternalGetValidatorDashboardSummaryResponse = ApiPagingResponse<VDBSummaryTableRow>;
export interface VDBGroupSummaryColumnItem {
  status_count: StatusCount;
  validators?: number /* uint64 */[];
}
export interface VDBGroupSummaryColumn {
  attestations_head: VDBGroupSummaryColumnItem;
  attestations_source: VDBGroupSummaryColumnItem;
  attestations_target: VDBGroupSummaryColumnItem;
  attestation_count: StatusCount;
  attestation_efficiency: number /* float64 */;
  attestation_avg_incl_dist: number /* float64 */;
  sync: VDBGroupSummaryColumnItem;
  proposals: VDBGroupSummaryColumnItem;
  slashed: VDBGroupSummaryColumnItem; // Failed slashings are count of validators in the group that were slashed
  apr: ClElValue<number /* float64 */>;
  income: ClElValue<string /* decimal.Decimal */>;
  luck: Luck;
}
export interface VDBGroupSummaryData {
  last_24h: VDBGroupSummaryColumn;
  last_7d: VDBGroupSummaryColumn;
  last_30d: VDBGroupSummaryColumn;
  all_time: VDBGroupSummaryColumn;
}
export type InternalGetValidatorDashboardGroupSummaryResponse = ApiDataResponse<VDBGroupSummaryData>;
export type InternalGetValidatorDashboardSummaryChartResponse = ApiDataResponse<ChartData<number /* int */, number /* float64 */>>; // line chart, series id is group id
export type InternalGetValidatorDashboardValidatorIndicesResponse = ApiDataResponse<number /* uint64 */[]>;
/**
 * ------------------------------------------------------------
 * Rewards Tab
 */
export interface VDBRewardesTableDuty {
  attestation?: number /* float64 */;
  proposal?: number /* float64 */;
  sync?: number /* float64 */;
  slashing?: number /* uint64 */;
}
export interface VDBRewardsTableRow {
  epoch: number /* uint64 */;
  duty: VDBRewardesTableDuty;
  group_id: number /* uint64 */;
  reward: ClElValue<string /* decimal.Decimal */>;
}
export type InternalGetValidatorDashboardRewardsResponse = ApiPagingResponse<VDBRewardsTableRow>;
export interface VDBGroupRewardsDetails {
  status_count: StatusCount;
  income: string /* decimal.Decimal */;
}
export interface VDBGroupRewardsData {
  attestations_source: VDBGroupRewardsDetails;
  attestations_target: VDBGroupRewardsDetails;
  attestations_head: VDBGroupRewardsDetails;
  sync: VDBGroupRewardsDetails;
  slashing: VDBGroupRewardsDetails;
  inactivity: VDBGroupRewardsDetails;
  proposal: VDBGroupRewardsDetails;
  proposal_el_reward: string /* decimal.Decimal */;
  proposal_cl_att_inc_reward: string /* decimal.Decimal */;
  proposal_cl_sync_inc_reward: string /* decimal.Decimal */;
  proposal_cl_slashing_inc_reward: string /* decimal.Decimal */;
}
export type InternalGetValidatorDashboardGroupRewardsResponse = ApiDataResponse<VDBGroupRewardsData>;
export type InternalGetValidatorDashboardRewardsChartResponse = ApiDataResponse<ChartData<number /* int */, string /* decimal.Decimal */>>; // bar chart, series id is group id, property is 'el' or 'cl'
export interface VDBEpochDutiesTableRow {
  validator: number /* uint64 */;
  duties: ValidatorHistoryDuties;
}
export type InternalGetValidatorDashboardDutiesResponse = ApiPagingResponse<VDBEpochDutiesTableRow>;
/**
 * ------------------------------------------------------------
 * Blocks Tab
 */
export interface VDBBlocksTableRow {
  proposer: number /* uint64 */;
  group_id: number /* uint64 */;
  epoch: number /* uint64 */;
  slot: number /* uint64 */;
  block: number /* uint64 */;
  status: 'success' | 'missed' | 'orphaned' | 'scheduled';
  reward_recipient: Address;
  reward: ClElValue<string /* decimal.Decimal */>;
  graffiti: string;
}
export type InternalGetValidatorDashboardBlocksResponse = ApiPagingResponse<VDBBlocksTableRow>;
/**
 * ------------------------------------------------------------
 * Heatmap Tab
 */
export interface VDBHeatmapCell {
  x: number /* uint64 */; // Epoch
  y: number /* uint64 */; // Group ID
  value: number /* float64 */; // Attestaton Rewards
}
export interface VDBHeatmap {
  epochs: number /* uint64 */[]; // X-Axis Categories
  group_ids: number /* uint64 */[]; // Y-Axis Categories
  data: VDBHeatmapCell[];
}
export type InternalGetValidatorDashboardHeatmapResponse = ApiDataResponse<VDBHeatmap>;
export interface VDBHeatmapTooltipDuty {
  validator: number /* uint64 */;
  status: 'success' | 'failed' | 'orphaned';
}
export interface VDBHeatmapTooltipData {
  epoch: number /* uint64 */;
  proposers: VDBHeatmapTooltipDuty[];
  syncs: VDBHeatmapTooltipDuty[];
  slashings: VDBHeatmapTooltipDuty[];
  attestations_head: StatusCount;
  attestations_source: StatusCount;
  attestations_target: StatusCount;
  attestation_income: string /* decimal.Decimal */;
}
export type InternalGetValidatorDashboardGroupHeatmapResponse = ApiDataResponse<VDBHeatmapTooltipData>;
/**
 * ------------------------------------------------------------
 * Deposits Tab
 */
export interface VDBExecutionDepositsTableRow {
  public_key: PubKey;
  index?: number /* uint64 */;
  group_id: number /* uint64 */;
  block: number /* uint64 */;
  timestamp: string /* time.Time */;
  from: Address;
  depositor: Address;
  tx_hash: Hash;
  withdrawal_credentials: Hash;
  amount: string /* decimal.Decimal */;
  valid: boolean;
}
export type InternalGetValidatorDashboardExecutionLayerDepositsResponse = ApiPagingResponse<VDBExecutionDepositsTableRow>;
export interface VDBConsensusDepositsTableRow {
  public_key: PubKey;
  index: number /* uint64 */;
  group_id: number /* uint64 */;
  epoch: number /* uint64 */;
  slot: number /* uint64 */;
  withdrawal_credential: Hash;
  amount: string /* decimal.Decimal */;
  signature: Hash;
}
export type InternalGetValidatorDashboardConsensusLayerDepositsResponse = ApiPagingResponse<VDBConsensusDepositsTableRow>;
/**
 * ------------------------------------------------------------
 * Withdrawals Tab
 */
export interface VDBWithdrawalsTableRow {
  epoch: number /* uint64 */;
  slot: number /* uint64 */;
  index: number /* uint64 */;
  group_id: number /* uint64 */;
  recipient: Address;
  amount: string /* decimal.Decimal */;
}
export type InternalGetValidatorDashboardWithdrawalsResponse = ApiPagingResponse<VDBWithdrawalsTableRow>;
/**
 * ------------------------------------------------------------
 * Manage Modal
 */
export interface VDBManageValidatorsTableRow {
  index: number /* uint64 */;
  public_key: PubKey;
  group_id: number /* uint64 */;
  balance: string /* decimal.Decimal */;
  status: 'pending' | 'online' | 'offline' | 'exiting' | 'exited' | 'slashed' | 'withdrawn';
  queue_position?: number /* uint64 */;
  withdrawal_credential: Hash;
}
export type InternalGetValidatorDashboardValidatorsResponse = ApiPagingResponse<VDBManageValidatorsTableRow>;
/**
 * ------------------------------------------------------------
 * Misc.
 */
export interface VDBPostReturnData {
  id: number /* uint64 */;
  user_id: number /* uint64 */;
  name: string;
  network: number /* uint64 */;
  created_at: string /* time.Time */;
}
export interface VDBPostCreateGroupData {
  id: number /* uint64 */;
  name: string;
}
export interface VDBPostValidatorsData {
  public_key: string;
  group_id: number /* uint64 */;
}
export interface VDBPostPublicIdData {
  public_id: string;
  name: string;
  share_settings: {
    group_names: boolean;
  };
}
