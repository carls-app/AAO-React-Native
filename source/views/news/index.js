/* eslint-disable camelcase */
/**
 * @flow
 * All About Olaf
 * News page
 */

import React from 'react'
import {TabNavigator} from '../components/tabbed-view'
import {TabBarIcon} from '../components/tabbar-icon'

import {newsImages} from '../../../images/news-images'
import NewsContainer from './news-container'

export default TabNavigator(
  {
    CarletonNewsView: {
      screen: ({navigation}) =>
        <NewsContainer
          navigation={navigation}
          mode="rss"
          url="https://apps.carleton.edu/media_relations/feeds/blogs/news"
          name="Carleton"
          thumbnail={newsImages.stolaf}
        />,
      navigationOptions: {
        tabBarLabel: 'Carleton',
        tabBarIcon: TabBarIcon('school'),
      },
    },

    CarletonianNewsView: {
      screen: ({navigation}) =>
        <NewsContainer
          navigation={navigation}
          mode="rss"
          url="https://apps.carleton.edu/carletonian/feeds/blogs/tonian"
          embedFeaturedImage={true}
          name="The Carletonian"
          thumbnail={newsImages.oleville}
        />,
      navigationOptions: {
        tabBarLabel: 'Carletonian',
        tabBarIcon: TabBarIcon('paper'),
      },
    },

    KrlxNewsView: {
      screen: ({navigation}) =>
        <NewsContainer
          navigation={navigation}
          mode="wp-json"
          url="https://www.krlx.org/wp-json/wp/v2/posts/"
          query={{per_page: 10, _embed: true}}
          name="KRLX"
          thumbnail={newsImages.mess}
        />,
      navigationOptions: {
        tabBarLabel: 'KRLX',
        tabBarIcon: TabBarIcon('radio'),
      },
    },
  },
  {
    navigationOptions: {
      title: 'News',
    },
  },
)
