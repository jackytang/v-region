import '../styles/group.sass'

import { ref, h, nextTick, onBeforeMount } from 'vue'

import IconTrash from '../icons/IconTrash.vue'

import { CN } from '../language'
import { commonProps, useData } from '../utils/data'
import { useLanguage, availableLevels } from '../utils/helper'

import { LEVELS, PROVINCE_KEY } from '../constants'

export default {
  name: 'RegionGroupCore',
  props: {
    ...commonProps,
    language: { type: String, default: CN }
  },
  emits: ['adjust', 'change', 'update:modelValue', 'complete'],
  setup (props, { emit, expose }) {
    const { data, setLevel, regionText, reset, getListByLevel } = useData(props, emit)
    const lang = useLanguage(props.language)
    const levels = availableLevels(props)

    const level = ref(undefined)

    function getNextLevel () {
      if (!level.value) return
      const index = levels.findIndex(val => val === level.value)

      return index < (levels.length - 1)
        ? levels[index + 1]
        : undefined
    }

    function clear () {
      reset()
      level.value = PROVINCE_KEY
      emit('adjust')
    }
    function pick (item) {
      if (!level.value) return

      setLevel(level.value, item)

      const next = getNextLevel()

      if (!next) {
        return emit('complete')
      }
      level.value = next
      nextTick(() => {
        emit('adjust')
      })
    }
    function match (item) {
      if (!item) return false
      if (!level.value) return false
      return data[level.value]?.key === item.key
    }

    function generateHeader () {
      const contents = []

      const title = regionText.value.join('') || lang.defaultHead
      const titleOption = {
        class: 'rg-header-text',
        title
      }
      contents.push(h('div', titleOption, title))

      const btnOption = {
        type: 'button',
        title: lang.clear,
        onClick: clear
      }
      const btn = h('button', btnOption, h(IconTrash))
      contents.push(h('div', { class: 'rg-header-control' }, btn))

      return h('div', { class: 'rg-header' }, contents)
    }
    function generateTabs () {
      const tabs = levels.map(val => {
        const levelItem = LEVELS.find(value => value.key === val)
        const link = h('a', {
          href: 'javascript:void(0)',
          onClick: () => { level.value = levelItem.key }
        }, levelItem.title)
        const option = {
          key: levelItem.key,
          class: { active: levelItem.key === level.value }
        }
        return h('li', option, link)
      })
      return h('div', { class: 'rg-level-tabs' }, h('ul', tabs))
    }
    function generateContent () {
      const child = []

      child.push(
        ...getListByLevel(level.value).value.map(val => {
          const option = {
            key: val.key,
            class: {
              'rg-item': true,
              active: match(val)
            },
            onMouseup: () => { pick(val) }
          }
          return h('li', option, val.value)
        })
      )

      if (!child.length) {
        child.push(h('li', { class: 'rg-message-box' }, lang.noMatch))
      }

      return h('div', { class: 'rg-results-container' }, [
        h('ul', { class: 'rg-results' }, child)
      ])
    }

    onBeforeMount(() => {
      level.value = PROVINCE_KEY
    })

    expose({ region: data, reset, regionText })

    return () => h('div', { class: 'rg-group' }, [
      generateHeader(),
      generateTabs(),
      generateContent()
    ])
  }
}
