// @flow

import * as React from 'react'

import {TabNavigator} from '../components/tabbed-view'
import {TabBarIcon} from '../components/tabbar-icon'

import {OtherModesView} from './other-modes'
import {ConnectedXyzBusView, ConnectedXyzBusList} from './xyz'

export {ConnectedXyzBusView} from './xyz/view'
export {OtherModesDetailView} from './other-modes'
export {BusMap} from './bus'

export default TabNavigator(
	{
		ExpressLineBusView: {
			screen: ({navigation}) => (
				<ConnectedXyzBusView navigation={navigation} routeName="Express Bus" />
			),
			navigationOptions: {
				tabBarLabel: 'Express Bus',
				tabBarIcon: TabBarIcon('subway'),
			},
		},

		CarlsGoBusView: {
			screen: ({navigation}) => (
				<ConnectedXyzBusView navigation={navigation} routeName={/Carls-Go/} />
			),
			navigationOptions: {
				tabBarLabel: 'CarlsGO',
				tabBarIcon: TabBarIcon('car'),
			},
		},

		BlueLineBusView: {
			screen: ({navigation}) => (
				<ConnectedXyzBusView navigation={navigation} routeName="Blue Line" />
			),
			navigationOptions: {
				tabBarLabel: 'Blue Line',
				tabBarIcon: TabBarIcon('bus'),
			},
		},

		TransportationOtherBusView: {
			screen: ConnectedXyzBusList,
		},

		TransportationOtherModesListView: {
			screen: OtherModesView,
		},
	},
	{
		navigationOptions: {
			title: 'Transportation',
		},
	},
)
