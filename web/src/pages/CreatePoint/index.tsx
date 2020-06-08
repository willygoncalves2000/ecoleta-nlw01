import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import { LeafletMouseEvent }from 'leaflet';

import usePersistedState from '../../utils/usePersistedState';

import { Switch } from '@material-ui/core';

import Dropzone from '../../components/Dropzone';

import './styles.css';

import logo from '../../assets/logo.svg';
import logoDarkTheme from '../../assets/logoDarkTheme.svg';


// state com array ou objeto: é preciso manualmente informar o tipo da variável armazenada

interface Item {
  id: number;
  name: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}


const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([]); //informo q esse state é um array de item
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  // Armazena as coordernadas da posição atual do usuario
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });


  const [darkMode, setDarkMode] = usePersistedState('theme', 'light');


  // Armazenar o UF e a Cidade selecionada pelo usuario, para fazer o cadastro do Ponto de Coleta
  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
  const [selectedFile, setSelectedFile] = useState<File>();

  const history = useHistory();

  useEffect(() => {
    // Retorna a posicao atual do usuario quandoa abrir a aplicação
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude} = position.coords;
      setInitialPosition([latitude, longitude]);
    });
  }, []);

  // Busca os items da API criada
  useEffect(()=> {
    api.get('items').then(response => {
      setItems(response.data);
      console.log(response.data);
    });
  }, []);

  // Busca os UFs para listar no select
  useEffect(() => {
    axios.get<IBGEUFResponse[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then(response => {
        const ufInitials = response.data.map(uf => uf.sigla);
        setUfs(ufInitials);
      });
  }, []);

  // Busca as cidades do estado (UF) selecionado
  useEffect(() => {
    if (selectedUf === '0'){
      return
    }
    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
      .then(response => {
        const cityNames = response.data.map(city => city.nome);
        setCities(cityNames);
      });
  }, [selectedUf]);

  // Obtem o UF q o usuário selecionou através do event
  function handlerSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;
    setSelectedUf(uf);
  }

  // Obtem a Cidade q o usuário selecionou através do event
  function handlerSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;
    setSelectedCity(city);
  } 

  // Obtem a latitude e longitude do local em que o usuario clicou no mapa
  function handlerMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng,
    ]);
  
  }

  function handlerInputChange(event: ChangeEvent<HTMLInputElement>) {
    // Obtem o name e o value do input onde o usuário digitou
    const { name, value} = event.target;
    
    // ... (spread operator) copia o que ja existe no formData
    setFormData({...formData, [name]: value});
  }

  function handlerSelectItem (id: number) {
    // Verifica se o ID de um item ja existe no array de items selecionados
    const alreadySelected = selectedItems.findIndex(item => item === id);

    // Se a varificação acima retornar um numéro igual ou maior q zero, significa
    // que este ID já existe no array, portanto vamos remove-lo,
    // caso retorne -1, ele nao existe e vamos adiciona-lo
    if (alreadySelected >= 0) {
      // Filtra os items, removendo o item correspondente a esse ID
      const filteredItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([ ...selectedItems, id ]);
    }

  }

  async function handlerSubmit(event: FormEvent) {
    event.preventDefault();

    

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = new FormData();

    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('uf', uf);
    data.append('city', city);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items.join(','));

    if (selectedFile) {
      data.append('image', selectedFile)
    }

    await api.post('points', data);

    alert('Ponto de Coleta criado!');

    history.push('/');
  }


  
  function handleChange (event: ChangeEvent<HTMLInputElement>) {
    setDarkMode(darkMode === 'light' ? 'dark' : 'light');
  }

  return (
    <div id={darkMode === 'dark' ? "page-create-point-dark" : "page-create-point"}>
      <header>
        <img src={darkMode ? logoDarkTheme : logo} alt="Ecoleta"/>
        <div className="theme-box">
          <Link to={{
              pathname:"/",
              state: {darkMode}     
            }}>
            <FiArrowLeft />
              Voltar para home
            </Link>
          <label>Dark Mode:</label>
          <Switch
            color="primary"
            onChange={handleChange}
            checked={darkMode === 'dark' ? true : false}
          />

        </div>

      </header>

      <form onSubmit={handlerSubmit}>
        <h1>Cadastro do  <br/> ponto de coleta</h1>

        <Dropzone onFileUploaded={setSelectedFile}/>


        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input 
              type="text"
              name="name"
              id="name"
              onChange={handlerInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="name">E-mail</label>
              <input 
                type="email"
                name="email"
                id="email"
                onChange={handlerInputChange}
              />
            </div>
            <div className="field">
            <label htmlFor="name">Whatsapp</label>
            <input 
              type="text"
              name="whatsapp"
              id="whatsapp"
              onChange={handlerInputChange}
            />
          </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={handlerMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={selectedPosition}/>
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" value={selectedUf} onChange={handlerSelectUf}>
                <option value="0">Selecione uma UF</option>
                {ufs.map(uf => (
                  <option key={uf} value={uf}> {uf} </option>
                ))};
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" value={selectedCity} onChange={handlerSelectCity}>
                <option value="0">Selecione uma Cidade</option>
                {cities.map(city => (
                  <option key={city}value={city}>{city}</option>
                ))};
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de Coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item => (
              <li 
                key={item.id} 
                onClick={() => handlerSelectItem(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt={item.name}/>
                <span>{item.name}</span>
              </li>
              ))}

          </ul>
        </fieldset>


        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>

  );
}

export default CreatePoint;