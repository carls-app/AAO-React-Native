// @flow

import * as React from 'react'
import {ScrollView, View, StyleSheet, StatusBar} from 'react-native'

import {connect} from 'react-redux'
import * as c from '../components/colors'
import sortBy from 'lodash/sortBy'
import {type TopLevelViewPropsType} from '../types'
import {type ViewType} from '../views'
import {type ReduxState} from '../../flux'
import {allViews} from '../views'
import {Column} from '../components/layout'
import {partitionByIndex} from '../../lib/partition-by-index'
import {HomeScreenButton, CELL_MARGIN} from './button'
import {openUrl} from '../components/open-url'
import {EditHomeButton, OpenSettingsButton} from '../components/nav-buttons'
import {UnofficialAppNotice} from './notice'

type ReactProps = TopLevelViewPropsType & {
	views: Array<ViewType>,
}
type ReduxStateProps = {
	order: Array<string>,
	inactiveViews: Array<string>,
	easterEggEnabled: boolean,
}

type Props = ReactProps & ReduxStateProps

function HomePage(props: Props) {
	let {navigation, order, inactiveViews, views = allViews} = props

	if (!props.easterEggEnabled) {
		views = views.filter(v => !v.easterEgg)
	}

	const sortedViews = sortBy(views, view => order.indexOf(view.view))

	const enabledViews = sortedViews.filter(
		view => !inactiveViews.includes(view.view),
	)

	const columns = partitionByIndex(enabledViews)

	return (
		<ScrollView
			alwaysBounceHorizontal={false}
			overflow="hidden"
			showsHorizontalScrollIndicator={false}
			showsVerticalScrollIndicator={false}
		>
			<StatusBar backgroundColor={c.carletonBlueAlt} barStyle="light-content" />

			<View style={styles.cells}>
				{columns.map((contents, i) => (
					<Column key={i} style={styles.column}>
						{contents.map(view => (
							<HomeScreenButton
								key={view.view}
								onPress={() => {
									if (view.type === 'url') {
										return openUrl(view.url)
									} else {
										return navigation.navigate(view.view)
									}
								}}
								view={view}
							/>
						))}
					</Column>
				))}
			</View>

			<UnofficialAppNotice />
		</ScrollView>
	)
}
HomePage.navigationOptions = ({navigation}) => {
	return {
		title: 'CARLS',
		headerBackTitle: 'Home',
		headerLeft: <OpenSettingsButton navigation={navigation} />,
		headerRight: <EditHomeButton navigation={navigation} />,
	}
}

function mapStateToProps(state: ReduxState): ReduxStateProps {
	if (!state.homescreen) {
		return {order: [], inactiveViews: [], easterEggEnabled: false}
	}

	return {
		order: state.homescreen.order,
		inactiveViews: state.homescreen.inactiveViews,
		easterEggEnabled: state.settings ? state.settings.easterEggEnabled : false,
	}
}

export default connect(mapStateToProps)(HomePage)

const styles = StyleSheet.create({
	cells: {
		marginHorizontal: CELL_MARGIN / 2,
		paddingTop: CELL_MARGIN,

		flexDirection: 'row',
	},
	column: {
		flex: 1,
	},
})
