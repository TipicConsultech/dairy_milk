
import React, { useState } from 'react'
import { CContainer, CNav, CNavItem, CNavLink } from '@coreui/react'
import MilkForm from './CreateProduct';

function CreateFactory() {
     const [activeTab, setActiveTab] = useState('upload');
  return (
    <div>
      <CNav variant="tabs">
      <CNavItem>
       <CNavLink
            href="#"
            active={activeTab === 'upload'}
            onClick={() => setActiveTab('upload')}
          >
           Create Factory Product 
          </CNavLink>
      </CNavItem>
      <CNavItem>
        <CNavLink 
       
        >Create Skim Milk or Cream</CNavLink>
      </CNavItem>
      
    </CNav>


<CContainer className="mt-4">
        {activeTab === 'upload' && <MilkForm />}
        {activeTab === 'link1' && <p>Link 1 content here.</p>}
        {activeTab === 'link2' && <p>Link 2 content here.</p>}
      </CContainer>


    </div>
  )
}

export default CreateFactory
