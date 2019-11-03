import React from 'react'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import IconButton from '@material-ui/core/IconButton'
import CardContent from '@material-ui/core/CardContent'
import CloseIcon from '@material-ui/icons/Close'
import DimensionSelect from './DimensionSelect'

const useStyles = makeStyles(theme => ({
  root: {
    margin: '8px 0'
  }
}))

const StatisticSearchParameterCard = ({
  statistic,
  onClose,
  onArgumentChange
}) => {
  const styles = useStyles()

  const {
    id,
    statistic_name,
    statistic_title_de,
    name,
    title_de,
    dimensions
  } = statistic

  const handleDimensionChange = argCode => event => {
    onArgumentChange({
      id,
      argCode,
      diff: {
        selected: event.target.value
      }
    })
  }

  const handleArgumentToggle = event => {
    onArgumentChange({
      id,
      argCode: event.target.value,
      diff: {
        active: event.target.checked
      }
    })
  }

  return (
    <Card className={styles.root}>
      <CardHeader
        action={
          <IconButton aria-label="settings" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        }
        title={`${name} - ${title_de}`}
        subheader={`${statistic_name} ${statistic_title_de}`}
      />
      <CardContent>
        {dimensions.map(dim => (
          <DimensionSelect
            key={dim.name}
            name={dim.name}
            label={dim.title_de}
            value={dim.selected}
            options={dim.values}
            active={dim.active}
            onChange={handleDimensionChange(dim.name)}
            onToggle={handleArgumentToggle}
          />
        ))}
      </CardContent>
    </Card>
  )
}

StatisticSearchParameterCard.propTypes = {
  statistic: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onArgumentChange: PropTypes.func.isRequired
}

export default StatisticSearchParameterCard
