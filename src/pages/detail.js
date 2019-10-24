import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import _ from 'lodash'

import Snackbar from '@material-ui/core/Snackbar'
import Drawer from '@material-ui/core/Drawer'

import { getAttributeArgs, extractAttribute } from '../lib/schema'
import DefaultLayout from '../layouts/Default'
import DataTable from '../components/DataTable'
// import RegionSelectTree from '../components/RegionSelectTree'
import AutocompleteSearchField from '../components/AutocompleteSearchField'
import ValueAttributeSelect from '../components/ValueAttributeSelect'
import { findInvalidRegionIds } from './api/region'
import RegionSearchParameterCard from '../components/RegionSearchParameterCard'

const drawerWidth = '33%'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex'
  },
  sidebar: {
    background: '#f5f5f5',
    height: '100%'
  },
  drawerPaper: {
    width: drawerWidth
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
  }
}))

const Detail = ({
  initialStatisticAndAttribute,
  initialRegions,
  initialError
}) => {
  const classes = useStyles()
  const [statisticAndAttribute, setStatisticAndAttribute] = useState(
    initialStatisticAndAttribute
  )
  const [args, setArgs] = useState([])
  const [regions, setRegions] = useState(initialRegions)
  const [error, setError] = useState(initialError)

  useEffect(() => {
    const attribute = extractAttribute(statisticAndAttribute)
    const attributeArgs = getAttributeArgs(attribute)
    setArgs(attributeArgs.map(arg => ({ ...arg, selected: [], active: false })))
  }, [statisticAndAttribute])

  // statistics selection

  const loadStatisticsOptions = async (value = '') => {
    const result = await fetch(`/api/search/statistics?filter=${value}`)
    return result.json()
  }

  const handleStatisticSelectionChange = value => {
    setStatisticAndAttribute(value)
  }

  const handleValueAttributeChange = index => event => {
    // TODO this is just a temporary solution, implement proper state management
    const newArgs = _.cloneDeep(args)
    newArgs[index].selected = event.target.value
    setArgs(newArgs)
  }

  const handleValueAttributeToggle = event => {
    // TODO this is just a temporary solution, implement proper state management
    const newArgs = _.cloneDeep(args)
    const toggledArg = newArgs.find(arg => arg.value === event.target.value)
    toggledArg.active = event.target.checked
    toggledArg.selected = event.target.checked
      ? toggledArg.values.map(v => v.value)
      : []
    setArgs(newArgs)
  }

  // regions selections

  const loadRegionOptions = async (value = '') => {
    const result = await fetch(`/api/search/regions?filter=${value}`)
    return result.json()
  }

  const handleRegionSelectionChange = value => setRegions([...regions, value])

  const handleRegionCardClose = index => () =>
    setRegions([...regions.slice(0, index), ...regions.slice(index + 1)])

  return (
    <DefaultLayout>
      <div className={classes.root}>
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper
          }}
        >
          <h2>Regionen</h2>
          <AutocompleteSearchField
            onSelectionChange={handleRegionSelectionChange}
            loadOptions={loadRegionOptions}
            value={regions}
            label="Regionen"
            placeholder="Regionen suchen"
          />
          {regions.map((region, index) => (
            <RegionSearchParameterCard
              key={index}
              title={region.label}
              text=""
              onClose={handleRegionCardClose(index)}
            />
          ))}
          <h2>Statistiken und Merkmale</h2>
          <AutocompleteSearchField
            onSelectionChange={handleStatisticSelectionChange}
            loadOptions={loadStatisticsOptions}
            value={statisticAndAttribute}
            label="Statistiken und Merkmale"
            placeholder="Merkmal oder Statistik suchen"
          />
          {args.map((arg, index) => {
            return (
              <ValueAttributeSelect
                key={arg.label}
                name={arg.value}
                label={arg.label}
                value={arg.selected}
                options={arg.values}
                active={arg.active}
                onChange={handleValueAttributeChange(index)}
                onToggle={handleValueAttributeToggle}
              />
            )
          })}
          {/*<RegionSelectTree*/}
          {/*  checked={regions}*/}
          {/*  onChecked={handleRegionSelectionChange}*/}
          {/*/>*/}
        </Drawer>

        <main className={classes.content}>
          <DataTable
            regions={regions}
            statisticAndAttribute={statisticAndAttribute}
            args={args}
          />

          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left'
            }}
            open={error !== null}
            onClose={() => setError(null)}
            autoHideDuration={6000}
            message={<span>{error}</span>}
          />
        </main>
      </div>
    </DefaultLayout>
  )
}

Detail.propTypes = {
  initialStatisticAndAttribute: PropTypes.string,
  initialRegions: PropTypes.arrayOf(PropTypes.string),
  initialError: PropTypes.string
}

Detail.defaultProps = {
  initialStatisticAndAttribute: null,
  initialRegions: [],
  initialError: null
}

Detail.getInitialProps = async function({ query }) {
  let initialError = null
  let initialRegions = []

  if (query.regions) {
    initialRegions = query.regions.split(',')
    const invalidRegions = findInvalidRegionIds(initialRegions)
    if (invalidRegions.length !== 0) {
      initialError = `Skipping invalid region${
        invalidRegions.length > 1 ? 's' : ''
      }: ${invalidRegions.join(',')}`
      initialRegions = initialRegions.filter(
        region => !invalidRegions.includes(region)
      )
    }
  }

  let initialStatisticAndAttribute = null
  if (query.statistic && query.attribute) {
    const result = await fetch(
      `http://localhost:3000/api/statistics?filter=${query.statistic} ${query.attribute}`
    )
    const jsonResult = await result.json()
    if (jsonResult.length === 1) {
      initialStatisticAndAttribute = jsonResult[0]
    } else {
      initialError = `Could not find statistic ${query.statistic} / attribute ${query.attribute}`
    }
  }

  return {
    initialStatisticAndAttribute,
    initialRegions,
    initialError
  }
}

export default Detail
