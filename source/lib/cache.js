// @flow
import {AsyncStorage} from 'react-native'
import moment from 'moment'

import type {CoursesByTermType} from './courses/types'

type BaseCacheResultType<T> = {
  isExpired: boolean,
  isCached: boolean,
  value: ?T,
}

type CacheResultType<T> = Promise<BaseCacheResultType<T>>

function needsUpdate(time: Date, [count, unit]: [number, string]): boolean {
  return moment(time).isBefore(moment().subtract(count, unit))
}

function annotateCacheEntry(stored) {
  // if nothing's stored, note that it's expired and not cached
  if (stored === null || stored === undefined) {
    return {isCached: false, isExpired: true, value: null}
  }

  // migration from old storage
  if (
    !('dateCached' in stored && 'timeToCache' in stored && 'value' in stored)
  ) {
    return {isCached: true, isExpired: true, value: stored}
  }

  // handle AsyncStorage entries that aren't caches, like the homescreen order
  if (!stored.timeToCache) {
    return {isCached: true, isExpired: false, value: stored.value}
  }

  const date = new Date(stored.dateCached)
  const isExpired = needsUpdate(date, stored.timeToCache)
  return {isCached: true, isExpired, value: stored.value}
}

/// MARK: Utilities

function setItem(key: string, value: any, cacheTime?: [number, string]) {
  const dataToStore = {
    dateCached: new Date().toUTCString(),
    timeToCache: cacheTime,
    value: value,
  }
  return AsyncStorage.setItem(`aao:${key}`, JSON.stringify(dataToStore))
}
function getItem(key: string): CacheResultType<any> {
  return AsyncStorage.getItem(`aao:${key}`).then(stored =>
    annotateCacheEntry(JSON.parse(stored)),
  )
}

/// MARK: courses

const studentNumberKey = 'courses:student-number'
const studentNumberCacheTime = [1, 'week']
export function setStudentNumber(idNumbers: number) {
  return setItem(studentNumberKey, idNumbers, studentNumberCacheTime)
}
export function getStudentNumber(): CacheResultType<number> {
  return getItem(studentNumberKey)
}

const coursesKey = 'courses'
const coursesCacheTime = [1, 'hour']
export function setAllCourses(courses: CoursesByTermType) {
  return setItem(coursesKey, courses, coursesCacheTime)
}
export function getAllCourses(): CacheResultType<?CoursesByTermType> {
  return getItem(coursesKey)
}

/// MARK: Financials

const flexBalanceKey = 'financials:flex'
const flexBalanceCacheTime = [5, 'minutes']
export function setFlexBalance(balance: ?string) {
  return setItem(flexBalanceKey, balance, flexBalanceCacheTime)
}
export function getFlexBalance(): CacheResultType<?string> {
  return getItem(flexBalanceKey)
}

const oleBalanceKey = 'financials:ole'
const oleBalanceCacheTime = [5, 'minutes']
export function setOleBalance(balance: ?string) {
  return setItem(oleBalanceKey, balance, oleBalanceCacheTime)
}
export function getOleBalance(): CacheResultType<?string> {
  return getItem(oleBalanceKey)
}

const schillersBalanceKey = 'financials:schillers'
const schillersBalanceCacheTime = [5, 'minutes']
export function setSchillersBalance(balance: ?number) {
  return setItem(schillersBalanceKey, balance, schillersBalanceCacheTime)
}
export function getSchillersBalance(): CacheResultType<?number> {
  return getItem(schillersBalanceKey)
}

const diningBalanceKey = 'financials:diningdollars'
const diningBalanceCacheTime = [5, 'minutes']
export function setDiningBalance(balance: ?number) {
  return setItem(diningBalanceKey, balance, diningBalanceCacheTime)
}
export function getDiningBalance(): CacheResultType<?number> {
  return getItem(diningBalanceKey)
}

const printBalanceKey = 'financials:print'
const printBalanceCacheTime = [5, 'minutes']
export function setPrintBalance(balance: ?string) {
  return setItem(printBalanceKey, balance, printBalanceCacheTime)
}
export function getPrintBalance(): CacheResultType<?string> {
  return getItem(printBalanceKey)
}

const dailyMealsKey = 'meals:daily'
const dailyMealsCacheTime = [5, 'minutes']
export function setDailyMealInfo(dailyMeals: ?string) {
  return setItem(dailyMealsKey, dailyMeals, dailyMealsCacheTime)
}
export function getDailyMealInfo(): CacheResultType<?string> {
  return getItem(dailyMealsKey)
}

const weeklyMealsKey = 'meals:weekly'
const weeklyMealsCacheTime = [5, 'minutes']
export function setWeeklyMealInfo(weeklyMeals: ?string) {
  return setItem(weeklyMealsKey, weeklyMeals, weeklyMealsCacheTime)
}
export function getWeeklyMealInfo(): CacheResultType<?string> {
  return getItem(weeklyMealsKey)
}

const mealPlanKey = 'meals:plan'
const mealPlanCacheTime = [5, 'minutes']
export function setMealPlanInfo(mealPlanName: ?string) {
  return setItem(mealPlanKey, mealPlanName, mealPlanCacheTime)
}
export function getMealPlanInfo(): CacheResultType<?string> {
  return getItem(mealPlanKey)
}

type BalancesInputType = {
  schillers: ?string,
  dining: ?string,
  print: ?string,
  daily: ?string,
  weekly: ?string,
}
export function setBalances({
  schillers,
  dining,
  print,
  daily,
  weekly,
}: BalancesInputType) {
  return Promise.all([
    setSchillersBalance(schillers),
    setDiningBalance(dining),
    setPrintBalance(print),
    setDailyMealInfo(daily),
    setWeeklyMealInfo(weekly),
  ])
}

type BalancesOutputType = {
  schillers: BaseCacheResultType<?string>,
  dining: BaseCacheResultType<?string>,
  print: BaseCacheResultType<?string>,
  daily: BaseCacheResultType<?string>,
  weekly: BaseCacheResultType<?string>,
  _isExpired: boolean,
  _isCached: boolean,
}
export async function getBalances(): Promise<BalancesOutputType> {
  const [schillers, dining, print, daily, weekly] = await Promise.all([
    getSchillersBalance(),
    getDiningBalance(),
    getPrintBalance(),
    getDailyMealInfo(),
    getWeeklyMealInfo(),
  ])

  const _isExpired =
    schillers.isExpired ||
    dining.isExpired ||
    print.isExpired ||
    daily.isExpired ||
    weekly.isExpired
  const _isCached =
    schillers.isCached ||
    dining.isCached ||
    print.isCached ||
    daily.isCached ||
    weekly.isCached

  return {schillers, dining, print, daily, weekly, _isExpired, _isCached}
}
