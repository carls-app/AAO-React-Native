// @flow

import {
	performLogin,
	saveLoginCredentials,
	clearLoginCredentials,
	type Credentials,
} from '../../lib/login'

import {
	getAcknowledgementStatus,
	setAcknowledgementStatus,
	getEasterEggStatus,
	setEasterEggStatus,
	setTokenValid,
	clearTokenValid,
} from '../../lib/storage'

import {type ReduxState} from '../index'
import {type UpdateBalancesType, updateBalances} from './balances'
import {Alert} from 'react-native'

export type LoginStateType = 'logged-out' | 'logged-in' | 'checking' | 'invalid'

type Dispatch<A: Action> = (action: A | Promise<A> | ThunkAction<A>) => any
type GetState = () => ReduxState
type ThunkAction<A: Action> = (dispatch: Dispatch<A>, getState: GetState) => any

const SET_LOGIN_CREDENTIALS = 'settings/SET_LOGIN_CREDENTIALS'
const CREDENTIALS_LOGIN_START = 'settings/CREDENTIALS_LOGIN_START'
const CREDENTIALS_LOGIN_SUCCESS = 'settings/CREDENTIALS_LOGIN_SUCCESS'
const CREDENTIALS_LOGIN_FAILURE = 'settings/CREDENTIALS_LOGIN_FAILURE'
const CREDENTIALS_LOGOUT = 'settings/CREDENTIALS_LOGOUT'
const CREDENTIALS_VALIDATE_START = 'settings/CREDENTIALS_VALIDATE_START'
const CREDENTIALS_VALIDATE_SUCCESS = 'settings/CREDENTIALS_VALIDATE_SUCCESS'
const CREDENTIALS_VALIDATE_FAILURE = 'settings/CREDENTIALS_VALIDATE_FAILURE'
const CHANGE_THEME = 'settings/CHANGE_THEME'
const SIS_ALERT_SEEN = 'settings/SIS_ALERT_SEEN'
const EASTER_EGG_ENABLED = 'settings/EASTER_EGG_ENABLED'
const TOKEN_LOGIN = 'settings/TOKEN_LOGIN'
const TOKEN_LOGOUT = 'settings/TOKEN_LOGOUT'

type SisAlertSeenAction = {|type: 'settings/SIS_ALERT_SEEN', payload: boolean|}
export async function loadAcknowledgement(): Promise<SisAlertSeenAction> {
	return {type: SIS_ALERT_SEEN, payload: await getAcknowledgementStatus()}
}

export async function hasSeenAcknowledgement(): Promise<SisAlertSeenAction> {
	await setAcknowledgementStatus(true)
	return {type: SIS_ALERT_SEEN, payload: true}
}

type EasterEggAction = {|type: 'settings/EASTER_EGG_ENABLED', payload: boolean|}
export async function loadEasterEggStatus(): Promise<EasterEggAction> {
	return {type: EASTER_EGG_ENABLED, payload: await getEasterEggStatus()}
}

export async function showEasterEgg(): Promise<EasterEggAction> {
	await setEasterEggStatus(true)
	return {type: EASTER_EGG_ENABLED, payload: true}
}

type SetCredentialsAction = {|
	type: 'settings/SET_LOGIN_CREDENTIALS',
	payload: Credentials,
|}
export async function setLoginCredentials(
	credentials: Credentials,
): Promise<SetCredentialsAction> {
	await saveLoginCredentials(credentials)
	return {type: SET_LOGIN_CREDENTIALS, payload: credentials}
}

type LoginStartAction = {|type: 'settings/CREDENTIALS_LOGIN_START'|}
type LoginSuccessAction = {|
	type: 'settings/CREDENTIALS_LOGIN_SUCCESS',
	payload: Credentials,
|}
type LoginFailureAction = {|type: 'settings/CREDENTIALS_LOGIN_FAILURE'|}
type LogInActions = LoginStartAction | LoginSuccessAction | LoginFailureAction

const showNetworkFailureMessage = () =>
	Alert.alert(
		'Network Failure',
		'You are not connected to the internet. Please connect if you want to access this feature.',
		[{text: 'OK'}],
	)

const showInvalidLoginMessage = () =>
	Alert.alert(
		'Invalid Login',
		'The username and password you provided do not match a valid account. Please try again.',
		[{text: 'OK'}],
	)

export function logInViaCredentials(
	credentials: Credentials,
): ThunkAction<LogInActions | UpdateBalancesType> {
	return async (dispatch, getState) => {
		dispatch({type: CREDENTIALS_LOGIN_START})
		const state = getState()
		const isConnected = state.app ? state.app.isConnected : false

		const result = await performLogin(credentials)
		if (result) {
			dispatch({type: CREDENTIALS_LOGIN_SUCCESS, payload: credentials})
			// since we logged in successfully, go ahead and fetch the meal info
			dispatch(updateBalances())
		} else {
			dispatch({type: CREDENTIALS_LOGIN_FAILURE})

			if (isConnected) {
				showInvalidLoginMessage()
			} else {
				showNetworkFailureMessage()
			}
		}
	}
}

export function logInViaToken(
	tokenStatus: boolean,
): ThunkAction<LogInActions | UpdateBalancesType> {
	return async (dispatch: any => any) => {
		await setTokenValid(tokenStatus)
		dispatch({type: TOKEN_LOGIN, payload: tokenStatus})

		if (tokenStatus) {
			// since we logged in successfully, go ahead and fetch the meal info
			dispatch(updateBalances())
		}
	}
}

export function setTokenValidity(isTokenValid: boolean) {
	return {type: TOKEN_LOGIN, payload: isTokenValid}
}

type CredentialsLogOutAction = {|type: 'settings/CREDENTIALS_LOGOUT'|}
export async function logOutViaCredentials(): Promise<CredentialsLogOutAction> {
	await clearLoginCredentials()
	return {type: CREDENTIALS_LOGOUT}
}

type TokenLogOutAction = {|type: 'settings/TOKEN_LOGOUT'|}
export async function logOutViaToken(): Promise<TokenLogOutAction> {
	// actually log out and clear the cookie
	await fetch('https://apps.carleton.edu/login/?logout=1')
	await clearTokenValid()
	return {type: TOKEN_LOGOUT}
}

type LogOutAction = CredentialsLogOutAction | TokenLogOutAction

type ValidateStartAction = {|type: 'settings/CREDENTIALS_VALIDATE_START'|}
type ValidateSuccessAction = {|type: 'settings/CREDENTIALS_VALIDATE_SUCCESS'|}
type ValidateFailureAction = {|type: 'settings/CREDENTIALS_VALIDATE_FAILURE'|}
type ValidateCredentialsActions =
	| ValidateStartAction
	| ValidateSuccessAction
	| ValidateFailureAction
export function validateLoginCredentials(
	credentials: Credentials,
): ThunkAction<ValidateCredentialsActions> {
	return async dispatch => {
		const {username, password} = credentials
		if (!username || !password) {
			return
		}

		dispatch({type: CREDENTIALS_VALIDATE_START})

		// we try a few times here because the network may not have stabilized
		// quite yet.
		const result = await performLogin(credentials, {attempts: 3})
		if (result) {
			dispatch({type: CREDENTIALS_VALIDATE_SUCCESS})
		} else {
			dispatch({type: CREDENTIALS_VALIDATE_FAILURE})
		}
	}
}

type Action =
	| SisAlertSeenAction
	| CredentialsActions
	| UpdateBalancesType
	| EasterEggAction

type CredentialsActions =
	| LogInActions
	| LogOutAction
	| ValidateCredentialsActions
	| SetCredentialsAction

export type State = {
	+theme: string,
	+dietaryPreferences: [],
	+unofficiallyAcknowledged: boolean,
	+easterEggEnabled: boolean,

	+username: string,
	+password: string,
	+loginState: LoginStateType,

	+tokenError: ?Error,
	+tokenValid: boolean,
}

const initialState = {
	theme: 'All About Olaf',
	dietaryPreferences: [],

	unofficiallyAcknowledged: false,
	easterEggEnabled: false,

	username: '',
	password: '',
	loginState: 'logged-out',

	tokenError: null,
	tokenValid: false,
}

export function settings(state: State = initialState, action: Action) {
	switch (action.type) {
		case CHANGE_THEME:
			return {...state, theme: action.payload}

		case SIS_ALERT_SEEN:
			return {...state, unofficiallyAcknowledged: action.payload}

		case CREDENTIALS_VALIDATE_START:
			return {...state, loginState: 'checking'}

		case CREDENTIALS_VALIDATE_SUCCESS:
			return {...state, loginState: 'logged-in'}

		case CREDENTIALS_VALIDATE_FAILURE:
			return {...state, loginState: 'invalid'}

		case CREDENTIALS_LOGIN_START:
			return {...state, loginState: 'checking'}

		case CREDENTIALS_LOGIN_SUCCESS: {
			return {
				...state,
				loginState: 'logged-in',
				username: action.payload.username,
				password: action.payload.password,
			}
		}

		case CREDENTIALS_LOGIN_FAILURE:
			return {...state, loginState: 'invalid'}

		case CREDENTIALS_LOGOUT: {
			return {
				...state,
				loginState: 'logged-out',
				username: '',
				password: '',
			}
		}

		case SET_LOGIN_CREDENTIALS: {
			return {
				...state,
				username: action.payload.username,
				password: action.payload.password,
			}
		}

		case EASTER_EGG_ENABLED:
			return {...state, easterEggEnabled: action.payload}

		case TOKEN_LOGIN: {
			if (action.error === true) {
				return {
					...state,
					tokenValid: false,
					tokenError: action.payload,
					loginState: 'invalid',
				}
			}

			return {
				...state,
				tokenValid: action.payload === true,
				tokenError: null,
				loginState: 'logged-in',
			}
		}

		case TOKEN_LOGOUT: {
			return {
				...state,
				tokenValid: false,
				tokenError: null,
				loginState: 'logged-out',
			}
		}

		default:
			return state
	}
}
