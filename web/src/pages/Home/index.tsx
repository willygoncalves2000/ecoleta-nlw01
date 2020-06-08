import React, { ChangeEvent } from 'react';
import { FiLogIn } from 'react-icons/fi';
import { Link } from 'react-router-dom'; //Colocando no lugar da tag <a/> do html para uma SPA

import usePersistedState from '../../utils/usePersistedState';

import { Switch } from '@material-ui/core';

import './styles.css'

import logo from '../../assets/logo.svg';
import logoDarkTheme from '../../assets/logoDarkTheme.svg';


const Home = () => {

  const [darkMode, setDarkMode] = usePersistedState('theme', 'light');

  function handleChange (event: ChangeEvent<HTMLInputElement>) {
    setDarkMode(darkMode === 'light' ? 'dark' : 'light');
  }

  return( 
      <div id={darkMode === 'dark' ? "page-home-dark" : "page-home" }>
        
        <div className="content">
          <header> 
            <img src={darkMode === 'dark' ? logoDarkTheme: logo} alt="Ecoleta" /> 
            <div className="theme-box">
              <label>Dark Mode:</label>
              <Switch
                color="primary"
                onChange={handleChange}
                checked={darkMode === 'dark' ? true : false}
              />
            </div>
            
          </header>

          <main>
            <h1>Seu marketplace de coleta de resíduos.</h1>
            <p>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</p>

            <Link to={{
              pathname:"/create-point",
              state: {darkMode}     
            }}>
              <span>
                <FiLogIn />
              </span>
              <strong>Cadastre um ponto de coleta</strong>
            </Link>
          
          </main>
        </div>
      </div>
  );
}

export default Home;