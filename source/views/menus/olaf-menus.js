// @flow
import React from 'react'
import {TabBarIcon} from '../components/tabbar-icon'
import {Platform, FlatList, StyleSheet} from 'react-native'
import type {TopLevelViewPropsType} from '../types'
import {Row} from '../components/layout'
import {ListRow, ListSeparator, Title, ListEmpty} from '../components/list'
import {BonAppHostedMenu} from './menu-bonapp'
import {GitHubHostedMenu} from './menu-github'

export const OlafStavMenuScreen = ({navigation}: TopLevelViewPropsType) => (
  <BonAppHostedMenu
    navigation={navigation}
    name="stav"
    cafeId="261"
    loadingMessage={[
      'Hunting Ferndale Turkey…',
      'Tracking wild vegan burgers…',
      '"Cooking" some lutefisk…',
      'Finding more mugs…',
      'Waiting for omlets…',
      'Putting out more cookies…',
    ]}
  />
)
OlafStavMenuScreen.navigationOptions = {
  title: 'Stav Hall',
  tabBarIcon: TabBarIcon('menu'),
}

export const OlafCageMenuScreen = ({navigation}: TopLevelViewPropsType) => (
  <BonAppHostedMenu
    navigation={navigation}
    name="cage"
    cafeId="262"
    ignoreProvidedMenus={true}
    loadingMessage={[
      'Checking for vegan cookies…',
      'Serving up some shakes…',
      'Waiting for menu screens to change…',
      'Frying chicken…',
      'Brewing coffee…',
    ]}
  />
)
OlafCageMenuScreen.navigationOptions = {
  title: 'The Cage',
  tabBarIcon: TabBarIcon('menu'),
}

export const OlafPauseMenuScreen = ({navigation}: TopLevelViewPropsType) => (
  <GitHubHostedMenu
    navigation={navigation}
    name="pause"
    loadingMessage={[
      'Mixing up a shake…',
      'Spinning up pizzas…',
      'Turning up the music…',
      'Putting ice cream on the cookies…',
      'Fixing the oven…',
    ]}
  />
)
OlafPauseMenuScreen.navigationOptions = {
  tabBarLabel: 'The Pause',
  tabBarIcon: TabBarIcon('menu'),
}

type OleCafeShape = {id: string, title: string}
const olafCafes = [
  {id: 'OlafStavMenuView', title: 'Stav Hall'},
  {id: 'OlafCageMenuView', title: 'The Cage'},
  {id: 'OlafPauseMenuView', title: 'The Pause'},
]

export class OlafCafeIndex extends React.Component {
  props: TopLevelViewPropsType

  renderItem = ({item}: {item: OleCafeShape}) => (
    <OleCafeRow
      id={item.id}
      title={item.title}
      onPress={this.props.navigation.navigate}
    />
  )

  keyExtractor = (item: OleCafeShape) => item.id

  render() {
    return (
      <FlatList
        ItemSeparatorComponent={ListSeparator}
        ListEmptyComponent={<ListEmpty mode="bug" />}
        style={styles.container}
        data={olafCafes}
        keyExtractor={this.keyExtractor}
        renderItem={this.renderItem}
      />
    )
  }
}

class OleCafeRow extends React.PureComponent {
  props: {
    id: string,
    title: string,
    onPress: string => any,
  }

  onPress = () => this.props.onPress(this.props.id)

  render() {
    return (
      <ListRow onPress={this.onPress} arrowPosition="center">
        <Row alignItems="center">
          <Title style={styles.rowText}>{this.props.title}</Title>
        </Row>
      </ListRow>
    )
  }
}

const styles = StyleSheet.create({
  rowText: {
    paddingVertical: 6,
  },
  container: {
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
})
