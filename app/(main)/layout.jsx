import React from 'react'

function mainLayout({children}) {
  return (
    <div className='container mx-auto my-30'>
      {children}
    </div>
  )
}

export default mainLayout
