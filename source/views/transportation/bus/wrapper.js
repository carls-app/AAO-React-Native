// @flow

import * as React from 'react'
import type {UnprocessedBusLine} from './types'
import {BusLine} from './line'
import {Timer} from '@frogpond/timer'
import {NoticeView, LoadingView} from '@frogpond/notice'
import type {TopLevelViewPropsType} from '../../types'
import {API} from '@frogpond/api'
import {fetchCachedApi, type CacheResult} from '@frogpond/cache'
import {timezone} from '@frogpond/constants'

type BusTimesCache = CacheResult<?Array<UnprocessedBusLine>>
const getBundledData = () =>
	Promise.resolve(require('../../../../docs/bus-times.json'))
const fetchBusTimes = (forReload?: boolean): BusTimesCache =>
	fetchCachedApi(API('/transit/bus'), {getBundledData, forReload})

type Props = TopLevelViewPropsType & {
	+line: string,
}

type State = {|
	busLines: Array<UnprocessedBusLine>,
	activeBusLine: ?UnprocessedBusLine,
	loading: boolean,
|}

export class BusView extends React.PureComponent<Props, State> {
	state = {
		busLines: [],
		activeBusLine: null,
		loading: true,
	}

	componentDidMount() {
		this.fetchData().then(() => {
			this.setState(() => ({loading: false}))
		})
	}

	fetchData = async () => {
		let {value} = await fetchBusTimes()
		let busLines = value || []
		let activeBusLine = busLines.find(({line}) => line === this.props.line)

		this.setState(() => ({busLines, activeBusLine}))
	}

	openMap = () => {
		this.props.navigation.navigate('BusMapView', {
			line: this.state.activeBusLine,
		})
	}

	render() {
		if (this.state.loading) {
			return <LoadingView />
		}

		const {activeBusLine} = this.state

		if (!activeBusLine) {
			const lines = this.state.busLines.map(({line}) => line).join(', ')
			const msg = `The line "${this.props.line}" was not found among ${lines}`
			return <NoticeView text={msg} />
		}

		return (
			<Timer
				interval={60000}
				moment={true}
				render={({now}) => (
					<BusLine line={activeBusLine} now={now} openMap={this.openMap} />
				)}
				timezone={timezone()}
			/>
		)
	}
}
