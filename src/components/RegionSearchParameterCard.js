import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

const useStyles = makeStyles((theme) => ({
  root: {
    margin: '8px 0',
  },
}))

const nutsToText = {
  1: 'NUTS 1 – Bundesländer',
  2: 'NUTS 2 – Regierungsbezirke',
  3: 'NUTS 3 – Landkreise, Kreise, kreisfreie Städte',
}

const RegionSearchParameterCard = ({ region, onClose }) => {
  const styles = useStyles()

  return (
    <Card className={styles.root}>
      <CardHeader
        action={
          <IconButton aria-label="settings" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        }
        title={region.name}
        subheader={nutsToText[region.level]}
      />
    </Card>
  )
}

RegionSearchParameterCard.propTypes = {
  onClose: PropTypes.func.isRequired,
  region: PropTypes.object.isRequired,
}

export default RegionSearchParameterCard
