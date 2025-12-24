import React, { useContext } from 'react'
import { ThemeContext } from '../../context/ThemeContext';

const Modal = ({children ,isOpen , onClose,title}) => {

  if(!isOpen) return null;

  const {isDark} = useContext(ThemeContext)
  
  
  return (

    <div className='fixed top-0 right-0 left-0 z-50 flex justify-center items-center 
      w-full h-full max-h-full overflow-y-auto overflow-x-hidden bg-transparent
    '>

        <div className='relative p-4 w-full max-w-2xl max-h-full'>
            <div className={`relative rounded-lg shadow-xl  backdrop-blur-sm bg-transparent border
              ${isDark? 'bg-gray-800/40 border-gray-800' : 'bg-white/50 border-gray-600'}`}>

                <div className={`flex items-center justify-between p-4 md:p-5 border-b rounded-xs ${isDark? 'border-gray-400' : 'border-black'}`}>
                <h3 className={`text-lg font-medium ${isDark? 'bg-gray-800/20 text-white' : 'bg-white/80 text-gray-700'}`}>
                {title} 
                </h3>

                <button type='button' onClick={onClose}

                className={`text-gray-400  hover:bg-gray-100 hover:rotate-10 transition-all duration-300
                rounded-lg text-sm w-6 h-6 inline-flex items-center justify-center 
                cursor-pointer  ${isDark? 'text-white' : 'text-gray-900'}`}>
               
                <img alt="svgImg" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy
                53My5vcmcvMjAwMC9zdmciICB2aWV3Qm94PSIwIDAgNDggNDgiIHdpZHRoPSI0OHB4IiBoZWlnaHQ9IjQ4cHgi
                IGJhc2VQcm9maWxlPSJiYXNpYyI+PHBhdGggZD0iTTM3LDQ1Yy0wLjI1NiwwLTAuNTEyLTAuMDk4LTAuNzA3LTA
                uMjkzTDI0LDMyLjQxNEwxMS43MDcsNDQuNzA3Yy0wLjM5MSwwLjM5MS0xLjAyMywwLjM5MS0xLjQxNCwwbC01LTUJQzUu
                MTA1LDM5LjUyLDUsMzkuMjY1LDUsMzl2LTJjMC0wLjI5NCwwLjEyOS0wLjU3MywwLjM1NC0wLjc2M2wxMi4xNy0xMC
                4yOThMNS4yOTMsMTMuNzA3QzUuMTA1LDEzLjUyLDUsMTMuMjY1LDUsMTN2LTIJYzAtMC4zNTEsMC4xODQtMC42NzcsMC40
                ODUtMC44NTdsNS0zYzAuMzk0LTAuMjM1LDAuODk4LTAuMTczLDEuMjIyLDAuMTVMMjQsMTkuNTg2TDM2LjI5Myw3Lj
                I5MwljMC4zMjQtMC4zMjQsMC44MjktMC4zODYsMS4yMjItMC4xNWw1LDNDNDIuODE2LDEwLjMyMyw0MywxMC42ND
                ksNDMsMTF2MmMwLDAuMjY1LTAuMTA1LDAuNTItMC4yOTMsMC43MDdMMzAuNDc2LDI1LjkzOAlsMTIuMTcsMTAuMjk4Qz
                QyLjg3MSwzNi40MjcsNDMsMzYuNzA2LDQzLDM3djJjMCwwLjI2NS0wLjEwNSwwLjUyLTAuMjkzLDAuNzA3bC01LDVDMzcuNTEyLDQ0LjkwMiwzNy4yNTYsNDUsMzcsNDV6Ii8+PHBvbHlnb24gZmlsbD0iI2ZmZiIgcG9pbnRzPSI0MiwzNyAyOSwyNCA0MiwxMSAzNyw2IDI0LDE5IDExLDYgNiwxMSAxOSwyNCA2LDM3IDExLDQyIDI0LDI5IDM3LDQyIi8+PHBhdGggZD0iTTM3LDQzYy0wLjI1NiwwLTAuNTEyLTAuMDk4LTAuNzA3LTAuMjkzTDI0LDMwLjQxNEwxMS43MDcsNDIuNzA3Yy0wLjM5MSwwLjM5MS0xLjAyMywwLjM5MS0xLjQxNCwwbC01LTUJYy0wLjM5MS0wLjM5MS0wLjM5MS0xLjAyMywwLTEuNDE0TDE3LjU4NiwyNEw1LjI5MywxMS43MDdjLTAuMzkxLTAuMzkxLTAuMzkxLTEuMDIzLDAtMS40MTRsNS01YzAuMzkxLTAuMzkxLDEuMDIzLTAuMzkxLDEuNDE0LDAJTDI0LDE3LjU4NkwzNi4yOTMsNS4yOTNjMC4zOTEtMC4zOTEsMS4wMjMtMC4zOTEsMS40MTQsMGw1LDVjMC4zOTEsMC4zOTEsMC4zOTEsMS4wMjMsMCwxLjQxNEwzMC40MTQsMjRsMTIuMjkzLDEyLjI5MwljMC4zOTEsMC4zOTEsMC4zOTEsMS4wMjMsMCwxLjQxNGwtNSw1QzM3LjUxMiw0Mi45MDIsMzcuMjU2LDQzLDM3LDQzeiBNMjQsMjhjMC4yNTYsMCwwLjUxMiwwLjA5OCwwLjcwNywwLjI5M0wzNyw0MC41ODZMNDAuNTg2LDM3CUwyOC4yOTMsMjQuNzA3Yy0wLjM5MS0wLjM5MS0wLjM5MS0xLjAyMywwLTEuNDE0TDQwLjU4NiwxMUwzNyw3LjQxNEwyNC43MDcsMTkuNzA3Yy0wLjM5MSwwLjM5MS0xLjAyMywwLjM5MS0xLjQxNCwwTDExLDcuNDE0CUw3LjQxNCwxMWwxMi4yOTMsMTIuMjkzYzAuMzkxLDAuMzkxLDAuMzkxLDEuMDIzLDAsMS40MTRMNy40MTQsMzdMMTEsNDAuNTg2bDEyLjI5My0xMi4yOTNDMjMuNDg4LDI4LjA5OCwyMy43NDQsMjgsMjQsMjh6Ii8+PC9zdmc+"/>
                
                </button>
                </div>

                <div className='p-5 md:p-5 space-y-4 '>{children}</div>
               
            </div>
        </div>
    </div>
  )
}

export default Modal;
