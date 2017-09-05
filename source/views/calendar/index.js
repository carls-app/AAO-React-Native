// @flow
/**
 * All About Olaf
 * Calendar page
 */

import React from 'react'
import {TabNavigator} from '../components/tabbed-view'
import {TabBarIcon} from '../components/tabbar-icon'

import {GoogleCalendarView} from './calendar-google'
import {ReasonCalendarView} from './calendar-reason'

export {EventDetail} from './event-detail'

export default TabNavigator(
  {
    CarletonCalendarView: {
      screen: ({navigation}) =>
        <ReasonCalendarView
          navigation={navigation}
          calendarUrl="https://apps.carleton.edu/calendar/"
        />,
      navigationOptions: {
        tabBarLabel: 'Carleton',
        tabBarIcon: TabBarIcon('school'),
      },
    },

    TheCaveCalendarView: {
      screen: ({navigation}) =>
        <ReasonCalendarView
          navigation={navigation}
          calendarUrl="https://apps.carleton.edu/student/orgs/cave/calendar/"
        />,
      navigationOptions: {
        tabBarLabel: 'The Cave',
        tabBarIcon: TabBarIcon('beer'),
      },
    },

    StOlafCalendarView: {
      screen: ({navigation}) =>
        <GoogleCalendarView
          navigation={navigation}
          calendarId="le6tdd9i38vgb7fcmha0hu66u9gjus2e@import.calendar.google.com"
        />,
      navigationOptions: {
        tabBarLabel: 'St. Olaf',
        tabBarIcon: TabBarIcon('school'),
      },
    },

    NorthfieldCalendarView: {
      screen: ({navigation}) =>
        <GoogleCalendarView
          navigation={navigation}
          calendarId="thisisnorthfield@gmail.com"
        />,
      navigationOptions: {
        tabBarLabel: 'Northfield',
        tabBarIcon: TabBarIcon('pin'),
      },
    },
  },
  {
    navigationOptions: {
      title: 'Calendar',
    },
  },
)
