// @flow
import {
  GoogleAnalyticsTracker,
  GoogleAnalyticsSettings,
} from 'react-native-google-analytics-bridge'
import {stringifyFilters} from './views/components/filter'

import {getAnalyticsOptOut} from './lib/storage'

if (process.env.NODE_ENV === 'development') {
  GoogleAnalyticsSettings.setOptOut(true)
}

const trackerId = 'UA-101221390-1'
export const tracker = new GoogleAnalyticsTracker(trackerId)

function disableIfOptedOut() {
  return getAnalyticsOptOut().then(didOptOut => {
    if (didOptOut) {
      GoogleAnalyticsSettings.setOptOut(true)
    }
  })
}
disableIfOptedOut()

// Google requires that custom dimensions be tracked by index, and we only get
// 20 custom dimensions, so I decided to centralize them here.
export function trackMenuFilters(menuName: string, filters: any) {
  tracker.trackEventWithCustomDimensionValues(
    'menus',
    'filter',
    {label: menuName},
    {'1': stringifyFilters(filters)},
  )
}

export function trackHomescreenOrder(order: string[]) {
  tracker.trackEventWithCustomDimensionValues(
    'homescreen',
    'reorder',
    {},
    {'2': order.join(', ')},
  )
}
