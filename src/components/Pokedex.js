import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import '../App.css';
import Multiselect from 'multiselect-react-dropdown';

const columns = [
  {
    name: 'ID',
    selector: (row) => <h3 className="pokemon-name">{row.id || 'Pokemon Stats'}</h3>
  },
  {
    name: 'Name',
    selector: (row) => <h3 className="pokemon-name">{row.name || 'Pokemon Name'}</h3>
  },
  {
    name: 'Image',
    selector: 'image',
    cell: (row) => <img src={row.image} alt={row.name} style={{ maxWidth: '100px' }} />
  },
  {
    name: 'Type',
    selector: (row) =>
      row.types
        .map((type, index) => (
          <span key={index} className={`tag ${type.type.name.toLowerCase()}`}>
            {type.type.name}
          </span>
        ))
        .reduce((prev, curr) => [prev, ' ', curr])
  },
  {
    name: 'stats',
    selector: (row) => {
      const baseStats = row.stats.map((stat) => stat.base_stat);
      const totalEVs = baseStats.reduce((acc, curr) => acc + curr, 0);
      const average = totalEVs / baseStats.length;

      return (
        <div className="stats-container">
          <div className="evs-container">
            <p className="evs">Total EVs:</p>
            <p className="value"> {totalEVs}</p>
          </div>
          <div className="evs-container">
            <p className="evs">Average:</p>
            <p className="value"> {average.toFixed(2)}</p>
          </div>
        </div>
      );
    }
  }
];

const Pokedex = () => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterText, setFilterText] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]); // State to track selected types
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [optionTypes, setOptionTypes] = useState();

  useEffect(() => {
    getTypes();
  }, []);

  useEffect(() => {
    fetchPokemons();
  }, [currentPage, itemsPerPage]); // Fetch pokemons when page or limit changes

  const fetchPokemons = async () => {
    setLoading(true);
    const offset = (currentPage - 1) * itemsPerPage;
    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon?limit=${itemsPerPage}&offset=${offset}`
    );
    const pokemonDataPromises = response.data.results.map(async (item, index) => {
      const detailsResponse = await axios.get(item.url);
      const id = offset + index + 1;
      return {
        id: id,
        name: item?.name,
        image: detailsResponse?.data?.sprites?.front_default,
        types: detailsResponse?.data?.types,
        stats: detailsResponse?.data?.stats
      };
    });
    const pokemonData = await Promise.all(pokemonDataPromises);
    setPokemons(pokemonData);
    setTotalItems(response?.data?.count);
    setLoading(false);
  };

  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  const getTypes = async () => {
    const data = [];
    const responce = await axios.get('https://pokeapi.co/api/v2/type');
    console.log(responce, 'responce');
    if (responce.status === 200) {
      console.log(responce, 'dfsf');
      responce.data.results.map((item) => {
        data.push({ value: item?.name, label: capitalize(item?.name) });
      });
      setOptionTypes(data);
    }
  };

  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const handleRowClick = (row) => {
    setSelectedPokemon(row);
  };

  const filteredItems = pokemons.filter((item) =>
    item.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const conditionalRowStyles = [
    {
      when: () => true, // Apply style to all rows
      style: {
        cursor: 'pointer'
      }
    }
  ];

  const handleTypeChange = (selectedList) => {
    setSelectedTypes(selectedList.map((option) => option.value));
  };

  const filteredPokemonsByTypes =
    selectedTypes.length > 0
      ? filteredItems.filter((item) =>
          item.types.some((type) => selectedTypes.includes(type.type.name))
        )
      : filteredItems;

  return (
    <div style={{ margin: '10px' }}>
      <Multiselect
        options={optionTypes}
        selectedValues={selectedTypes.map((value) => ({
          value,
          label: value.charAt(0).toUpperCase() + value.slice(1)
        }))}
        onSelect={handleTypeChange}
        onRemove={handleTypeChange}
        displayValue="label"
        placeholder="Select Pokemon by types"
        className="custom-multiselect"
      />

      {/* DataTable */}
      <DataTable
        title="Pokedex Table"
        columns={columns}
        data={filteredPokemonsByTypes}
        progressPending={loading}
        pagination
        paginationServer
        paginationTotalRows={totalItems}
        paginationPerPage={itemsPerPage}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handleItemsPerPageChange}
        subHeader
        subHeaderComponent={
          <input
            type="text"
            placeholder="Search by Name"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        }
        onRowClicked={handleRowClick} // Handle row click events
        conditionalRowStyles={conditionalRowStyles} // Apply conditional styles on row hover
      />

      {/* Modal to display selected Pokémon */}
      {selectedPokemon && (
        <div className="custom-modal">
          <div className="modal-content">
            <aside className="StatsPanel">
              <img src={selectedPokemon.image} alt={selectedPokemon.name} />
              <div className="pokemon-name">{selectedPokemon.name || 'Pokemon Stats'}</div>
              <div className="info-wrapper">
                <div key="statistics" className="info-block">
                  <p key="statistics-title" className="title">
                    Statistics
                  </p>
                  {selectedPokemon?.stats?.map((item) => (
                    <p key={item?.stat?.name}>
                      <span key={item?.stat?.name + '-stat'} className="stat-name">
                        {item?.stat?.name}
                      </span>
                      :
                      <span key={item?.stat?.name + '-value'} className="stat-value">
                        {' '}
                        {item?.base_stat}
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            </aside>
            <button onClick={() => setSelectedPokemon(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pokedex;
