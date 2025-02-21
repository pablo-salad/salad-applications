import type { Location } from 'history'
import type { RouteComponentProps } from 'react-router'
import { Redirect, Route, Switch, withRouter } from 'react-router'
import { NoPageFound } from './components'
import { FeatureFlags, useFeatureManager } from './FeatureManager'
import { BackupCodesPageContainer } from './modules/backup-codes/BackupCodesPageContainer'
import { ReplaceBonusModalContainer } from './modules/bonus-views'
import { DemandMonitorPageContainer } from './modules/demand-monitor-views/DemandMonitorPage'
import { EarnInfoPage, EarningSummaryContainer } from './modules/earn-views'
import { OldEarningSummaryContainer } from './modules/earn-views/OldEarningSummaryContainer'
import { ExitSurveyContainer } from './modules/exit-survey-views'
import { PasskeyDeletePageContainer } from './modules/passkey-delete'
import { ProtectedActionPageContainer } from './modules/protected-action'
import { RewardDetailsContainer, SelectTargetRewardContainer } from './modules/reward-views'
import { SaladPayOrderSummaryContainer } from './modules/salad-pay-views'
import { SettingsContainer } from './modules/settings-views'
import { StorefrontHomePage } from './modules/storefront-views/pages/StorefrontHomePage'
import { VaultListContainer } from './modules/vault-views'

interface Props extends RouteComponentProps {
  isAuthenticated: boolean
}

const _Routes = ({ location, isAuthenticated }: Props) => {
  const featureManager = useFeatureManager()
  const isDemandMonitorFeatureFlagEnabled = featureManager.isEnabled(FeatureFlags.DemandMonitor)
  const isFleetDashboardFeatureFlagEnabled = featureManager.isEnabled(FeatureFlags.FleetDashboard)

  const currentLocation =
    (location.state as { currentLocation: Location | undefined } | undefined)?.currentLocation || location

  return (
    <Switch location={currentLocation}>
      {/* Store Pages */}
      <Route path={['/store', '/store/search']} exact render={() => <StorefrontHomePage />} />
      <Route path="/store/rewards/:id" exact component={RewardDetailsContainer} />
      <Route path="/store/vault" exact component={VaultListContainer} />
      {/* Recommended Target Rewards Page */}
      <Route path="/store/select-target-reward" exact component={SelectTargetRewardContainer} />
      {/* Modals */}
      {/* SaladPay: This is stand in until we figure out iFrames, popups... */}
      <Route exact path="/salad-pay/order-summary" component={SaladPayOrderSummaryContainer} />
      <Route exact path="/bonuses/replace-bonus" component={ReplaceBonusModalContainer} />
      {/* Account */}
      <Redirect exact from="/account" to="/account/summary" />
      <Route path="/account/exit-survey" component={ExitSurveyContainer} />
      <Route path="/account/passkey/delete/:id" exact component={PasskeyDeletePageContainer} />
      <Route path="/account/backup-codes" exact component={BackupCodesPageContainer} />
      <Route path="/account" component={SettingsContainer} />
      {/* Protected Action */}
      <Route path="/protected-action" component={ProtectedActionPageContainer} />
      {/* Earn Pages */}
      {isAuthenticated && <Redirect exact from="/earn" to="/earn/summary" />}
      <Route
        path="/earn/summary"
        component={isFleetDashboardFeatureFlagEnabled ? EarningSummaryContainer : OldEarningSummaryContainer}
      />
      {isDemandMonitorFeatureFlagEnabled && <Route path="/earn/demand" exact component={DemandMonitorPageContainer} />}
      <Route path="/earn" component={EarnInfoPage} />
      <Route
        exact
        path="/search"
        component={({ location }: RouteComponentProps) => (
          <Redirect
            to={{
              ...location,
              pathname: `/store${location.pathname}`,
            }}
          />
        )}
      />
      <Redirect exact from="/rewards/:id" to="/store/rewards/:id" />
      <Redirect exact from="/" to="/store" />
      <Route component={NoPageFound} />
    </Switch>
  )
}

export const Routes = withRouter(_Routes)
