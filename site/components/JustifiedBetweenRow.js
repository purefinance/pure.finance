import React from 'react'

const JustifiedBetweenRow = ({ keyComponent, valueComponent }) => (
  <div className="flex justify-between">
    {keyComponent}
    {valueComponent}
  </div>
)

export default JustifiedBetweenRow
