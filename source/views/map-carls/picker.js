// @flow

import * as React from 'react'
import {StyleSheet} from 'react-native'
import * as c from '../components/colors'
import {SearchBar} from '../components/searchbar'
import type {Building, Feature} from './types'
import {CategoryPicker} from './category-picker'
import {BuildingList} from './building-list'
import fuzzyfind from 'fuzzyfind'

type Props = {
	features: Array<Feature<Building>>,
	onSelect: string => any,
	overlaySize: 'min' | 'mid' | 'max',
	onFocus: () => any,
	onCancel: () => any,
	onSearch: string => any,
	searchQuery: string,
	onCategoryChange: string => any,
	category: string,
}

export class BuildingPicker extends React.Component<Props> {
	componentDidUpdate(prevProps: Props) {
		const lastSize = prevProps.overlaySize
		const thisSize = this.props.overlaySize

		if (lastSize !== thisSize && lastSize === 'max') {
			this.dismissKeyboard()
		}
	}

	searchBar: any = null

	dismissKeyboard = () => this.searchBar.unFocus()

	performSearch = (text: string) => {
		// Android clear button returns an object
		if (typeof text !== 'string') {
			return this.props.onSearch('')
		}

		return this.props.onSearch(text)
	}

	onSelectBuilding = (id: string) => this.props.onSelect(id)

	onFocus = () => {
		this.props.onFocus()
	}

	onCancel = () => {
		this.dismissKeyboard()
		this.props.onCancel()
	}

	onOverlaySizeChange = (size: 'min' | 'mid' | 'max') => {
		this.setState(state => {
			if (state.size === 'max' && state.size !== size) {
				this.dismissKeyboard()
			}
		})
	}

	allCategories = ['Buildings', 'Outdoors', 'Parking', 'Athletics']
	categoryLookup = {
		Buildings: 'building',
		Outdoors: 'outdoors',
		Parking: 'parking',
		Athletics: 'athletics',
	}

	render() {
		// I don't inject the search query into the Search box because
		// it manages its text separately from RN, so you get jumpy editing.
		// Unfortunately, you also lose your search query when it unmounts and remounts.
		const search = (
			<SearchBar
				getRef={ref => (this.searchBar = ref)}
				onCancel={this.onCancel}
				onChangeText={this.performSearch}
				onFocus={this.onFocus}
				onSearchButtonPress={this.dismissKeyboard}
				placeholder="Search for a place"
				style={styles.searchBox}
				textFieldBackgroundColor={c.iosGray}
			/>
		)

		const picker = !this.props.searchQuery ? (
			<CategoryPicker
				categories={this.allCategories}
				onChange={this.props.onCategoryChange}
				selected={this.props.category}
			/>
		) : null

		let matches = this.props.features

		if (this.props.searchQuery) {
			matches = fuzzyfind(this.props.searchQuery, matches, {
				accessor: b => b.properties.name.toLowerCase(),
			})
		} else {
			const selectedCategory = this.categoryLookup[this.props.category]
			matches = matches.filter(b =>
				b.properties.categories.includes(selectedCategory),
			)
		}

		return (
			<React.Fragment>
				{search}
				{picker}
				<BuildingList
					buildings={matches}
					onSelect={this.onSelectBuilding}
					scrollEnabled={this.props.overlaySize === 'max'}
				/>
			</React.Fragment>
		)
	}
}

const styles = StyleSheet.create({
	searchBox: {
		marginHorizontal: 6,
	},
})
