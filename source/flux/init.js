/**
 * @flow
 * Functions to initialize bits of the global state, as appropriate
 */

import {NetInfo} from 'react-native'
import {loadLoginCredentials} from '../lib/login'
import {updateOnlineStatus} from './parts/app'
import {loadHomescreenOrder, loadDisabledViews} from './parts/homescreen'
import {getEnabledTools} from './parts/help'
import {loadFavoriteBuildings} from './parts/buildings'
import {
	setLoginCredentials,
	validateLoginCredentials,
	loadAcknowledgement,
	loadEasterEggStatus,
} from './parts/settings'
import {updateBalances} from './parts/balances'
import {loadRecentSearches, loadRecentFilters} from './parts/courses'

async function loginCredentials(store) {
	const {username, password} = await loadLoginCredentials()
	if (!username || !password) {
		return
	}
	store.dispatch(setLoginCredentials({username, password}))
}

async function validateOlafCredentials(store) {
	const {username, password} = await loadLoginCredentials()
	if (!username || !password) {
		return
	}
	store.dispatch(validateLoginCredentials({username, password}))
}

function netInfoIsConnected(store) {
	function updateConnectionStatus(isConnected) {
		store.dispatch(updateOnlineStatus(isConnected))
	}

	NetInfo.isConnected.addEventListener(
		'connectionChange',
		updateConnectionStatus,
	)
	return NetInfo.isConnected.fetch().then(updateConnectionStatus)
}

export async function init(store: {dispatch: any => any}) {
	// this function runs in two parts: the things that don't care about
	// network, and those that do.

	// kick off the parts that don't care about network in parallel
	await Promise.all([
		store.dispatch(loadHomescreenOrder()),
		store.dispatch(loadDisabledViews()),
		store.dispatch(loadAcknowledgement()),
		store.dispatch(loadEasterEggStatus()),
		store.dispatch(loadFavoriteBuildings()),
		store.dispatch(loadRecentSearches()),
		store.dispatch(loadRecentFilters()),
		loginCredentials(store),
	])

	// wait for our first connection check to happen
	await netInfoIsConnected(store)

	// then go do the network stuff in parallel
	await Promise.all([
		validateOlafCredentials(store),
		store.dispatch(updateBalances(false)),
		store.dispatch(getEnabledTools()),
	])
}
