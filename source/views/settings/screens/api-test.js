// @flow
import * as React from 'react'
import * as c from '@frogpond/colors'
import {Platform, StyleSheet, ScrollView, TextInput, Text} from 'react-native'
import {Toolbar} from '@frogpond/toolbar'
import {fetch} from '@frogpond/fetch'
import {API} from '@frogpond/api'
import glamorous from 'glamorous-native'
import {iOSUIKit, material} from 'react-native-typography'
import type {NavigationScreenProp} from 'react-navigation'

const styles = StyleSheet.create({
	container: {
		backgroundColor: c.white,
		flex: 1,
	},
	default: {
		height: 44,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderColor: c.black,
		flex: 1,
		fontSize: 13,
		paddingVertical: 4,
		paddingHorizontal: 8,
	},
	data: {
		paddingVertical: 10,
		paddingTop: 10,
	},
})

export const Paragraph = glamorous(Text)({
	marginVertical: 3,
	paddingRight: 4,
	...Platform.select({
		ios: iOSUIKit.bodyObject,
		android: material.body1Object,
	}),
})

type Props = {
	navigation: NavigationScreenProp<*>,
}

type State = {
	results: string,
	error: string,
}

export class APITestView extends React.PureComponent<Props, State> {
	static navigationOptions = {
		title: 'API Tester',
	}

	state = {
		results: '',
		error: '',
	}

	fetchData = async (path: string) => {
		try {
			let responseData: Array<any> = await fetch(API(path), {
				cache: 'no-store',
			}).json()
			let stringifiedResults = JSON.stringify(responseData)
			this.setState(() => ({results: stringifiedResults, error: ''}))
		} catch (err) {
			let stringifiedError = JSON.stringify(err)
			this.setState(() => ({results: '', error: stringifiedError}))
		}
	}

	render() {
		let {error, results} = this.state
		return (
			<>
				<Toolbar onPress={() => {}}>
					<TextInput
						keyboardType="web-search"
						onEndEditing={e => this.fetchData(e.nativeEvent.text)}
						placeholder="path/to/resource"
						returnKeyType="done"
						style={styles.default}
					/>
				</Toolbar>
				<ScrollView style={styles.container}>
					{error ? <Text style={styles.data}>{error}</Text> : null}
					{results ? <Paragraph>{results}</Paragraph> : null}
				</ScrollView>
			</>
		)
	}
}
