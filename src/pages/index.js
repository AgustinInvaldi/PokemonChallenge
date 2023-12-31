import Head from "next/head";

import { Inter, Island_Moments } from "next/font/google";
import "@/assets/styles/Home.module.css";
import axios from "axios";
const inter = Inter({ subsets: ["latin"] });
import { useEffect, useState } from "react";
import {
  Stack, useToast, SimpleGrid, Spinner, Box, Modal, ModalOverlay, ModalHeader, ModalBody, ModalContent, ModalCloseButton, useDisclosure, Tabs, TabList, TabPanels, Tab, TabPanel
} from "@chakra-ui/react";
import { Button, Container, Image, Pagination } from 'react-bootstrap';
import PokemonCard from "@/components/PokemonCard";
import PokemonData from "@/components/PokemonData";
import { backgrounds } from "@/components/Constants";

export default function Home() {
  // Constantes de estado
  const pokemonDataModal = useDisclosure(),
    toast = useToast(),
    [isLoading, setIsLoading] = useState(false),
    [pokemon, setPokemon] = useState([]),
    [selectedPokemon, setSelectedPokemon] = useState(),
    [tabIndex, setTabIndex] = useState(0),
    [currentPage, setCurrentPage] = useState(1),
    [totalPages, setTotalPages] = useState(1),
    getPokemonsURL = (tabIndex) => {
      if (tabIndex === 0) {
        return `https://pokeapi.co/api/v2/pokemon/?limit=20&offset=${(currentPage - 1) * 20}`;
      } else if (tabIndex === 1) {
        return `http://localhost:3001/api/catched`;
      }
      return null;
    };

  // Funcion para cargar los pokemones
  const loadMorePokemon = () => {
    setIsLoading(true);
    setPokemon([])
    // Obtengo la url segun el indice
    const url = getPokemonsURL(tabIndex);
    try {
      axios.get(url).then(async ({ data }) => {
        //Distingo entre tab para ver que acciones ejecuto
        if (tabIndex === 1) {
          setPokemon(data.catchedPokemon);
          setIsLoading(false)
        } else {
          const response = await axios.get(url);
          const totalPokemon = response.data.count;
          setTotalPages(Math.ceil(totalPokemon / 20));
          const promises = data.results.map((result) => axios(result.url));
          const fetchedPokemon = (await Promise.all(promises)).map(
            (res) => res.data
          );
          setPokemon(fetchedPokemon);
          setIsLoading(false)
        }
      });
    } catch (e) { console.log("ERR" - e) }
  }

  useEffect(() => {
    loadMorePokemon();
  }, [tabIndex, currentPage]);

  //Funcion para avanzar de pagina en el paginado de pokemones
  const handlePageChange = (page) => {
    setIsLoading(true)
    setCurrentPage(page);
  };

  // Funcion para volver a la primer pagina del listado
  const handleGoToFirstPage = () => {
    setCurrentPage(1);
  };

  // Funcion para ir a la ultima pagina del listado
  const handleGoToLastPage = () => {
    setCurrentPage(totalPages);
  };

  //Funcion para renderizar el paginado
  const renderPagination = () => {
    const startPage = Math.max(1, currentPage - 5);
    const endPage = Math.min(totalPages, startPage + 10);

    return (
      <Pagination >
        <Pagination.First disabled={currentPage === 1} onClick={handleGoToFirstPage} />
        <Pagination.Prev disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} />
        {Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index).map((page) => (
          <Pagination.Item
            key={page}
            active={currentPage === page}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Pagination.Item>
        ))}
        <Pagination.Next disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} />
        <Pagination.Last disabled={currentPage === totalPages} onClick={handleGoToLastPage} />
      </Pagination>
    );
  };

  // Funcion para eliminar un pokemon
  const deletePokemon = async (pokemon) => {
    try {
      setIsLoading(true)
      const response1 = await axios.delete(`http://localhost:3001/api/data/${pokemon.id}`);
      if (response1.status === 200) {
        toast({
          title: 'Pokemon liberado',
          description: "El pokemon fue liberado correctamente",
          status: 'success',
          duration: 4000,
          isClosable: true,
          position: 'top-right'
        })
      };
      const response = await axios.get('http://localhost:3001/api/catched');
      console.log("response", response);
      setIsLoading(false)
      setPokemon(response.data.catchedPokemon);
      pokemonDataModal.onClose();
    } catch (error) {
      console.error('Error al eliminar el dato:', error);
    }
  }

  // Funcion para abrir el modal de detalles del pokemon
  function handleViewPokemon(pokemon) {
    setSelectedPokemon(pokemon);
    pokemonDataModal.onOpen();
  }

  return (
    <>
      <Head>
        <title>Pokemon Challenge</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
          integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
          crossorigin="anonymous"
        />
      </Head>
      <Container fluid className="w-100">
        <Image fluid src="https://storefronts-assets.tcgplayer.com/media/be17428e-4fe5-4e94-b862-a952f98daf49/547d0789-79b1-4cc0-9844-39756923e4fb/pokemon-banner@2x.jpg" alt="alternatetext" />
        <Tabs onChange={(index) => setTabIndex(index)}>
          <TabList>
            <Tab className="w-50">Pokedex</Tab>
            <Tab className="w-50">Mis pokemones</Tab>
          </TabList>

          {isLoading ?
            <div style={{ height: '25rem' }} className="d-flex justify-content-center align-items-center">
              <Spinner
                thickness='4px'
                speed='0.65s'
                emptyColor='gray.200'
                color='blue.500'
                size='xl'
              />
            </div>
            :
            <TabPanels>
              <TabPanel>
                <Stack p="5" alignItems="center" spacing="5">
                  <SimpleGrid spacing="5" columns={{ base: 1, md: 5 }}>
                    {pokemon.map((pokemon) => (
                      <Box
                        as="button"
                        key={pokemon.id}
                        onClick={() => handleViewPokemon(pokemon)}
                      >
                        <PokemonCard pokemon={pokemon} />
                      </Box>
                    ))}
                  </SimpleGrid>
                  {renderPagination()}
                </Stack>
              </TabPanel>
              <TabPanel>
                {pokemon.length > 0 ?
                  <Stack p="5" alignItems="center" spacing="5">
                    <SimpleGrid spacing="5" columns={{ base: 1, md: 5 }}>
                      {pokemon.map((pokemon) => (
                        <Box
                          as="button"
                          key={pokemon.id}
                          onClick={() => handleViewPokemon(pokemon)}
                        >
                          <PokemonCard pokemon={pokemon} catched={true} />
                        </Box>
                      ))}
                    </SimpleGrid>
                  </Stack>
                  :
                  <div className="d-flex justify-content-center"><h3>Todavia no tienes pokemones capturados</h3></div>

                }

              </TabPanel>
            </TabPanels>
          }
        </Tabs>
      </Container>
      <Modal {...pokemonDataModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader style={{ background: backgrounds.find(item => item.name === selectedPokemon?.types[0]?.type?.name)?.background }} textTransform="capitalize" />
          <ModalCloseButton />
          <ModalBody className="p-0">
            {selectedPokemon && <PokemonData pokemon={selectedPokemon} tabIndex={tabIndex} deletePokemon={deletePokemon} />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
