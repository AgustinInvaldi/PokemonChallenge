import React from "react";
//Componentes personalizados
import { Image, Stack, Tabs, TabList, TabPanels, TabPanel, Progress, Text, Tab, Badge, Button, useToast, Tag } from "@chakra-ui/react";
import { Card, Row, Col } from "react-bootstrap";
//Llamadas a la api
import axios from "axios";
//Fondos personalizado por cada tipo de pokemon
import { backgrounds } from "./Constants";

export default function PokemonData({ pokemon, tabIndex, deletePokemon }) {

  // Notificaciones
  const toast = useToast()

  //Funcion para guardar pokemones atrapados
  const handleSaveData = async ({ pokemon }) => {
    const bodySavePokemon = {
      id: pokemon.id,
      height: pokemon.height,
      weight: pokemon.weight,
      name: pokemon.name,
      types: pokemon.types,
      abilities: pokemon.abilities,
      stats: pokemon.stats
    }

    const response = await axios.get('http://localhost:3001/api/catched');

    //Compruebo que el pokemon no exista
    const index = response.data.catchedPokemon.findIndex(
      object => object.id === pokemon.id,
    );

    if (index === -1) {
      try {
        await axios.post('http://localhost:3001/api/catched', { value: bodySavePokemon });
        const response = await axios.get('http://localhost:3001/api/catched');
        toast({
          title: 'Pokemon capturado',
          description: "El pokemon fue capturado correctamente",
          status: 'success',
          duration: 4000,
          isClosable: true,
          position: 'top-right'
        })
        setData(response.data);
      } catch (error) {
        console.error('Error al guardar el dato:', error);
      }
    } else {
      toast({
        title: 'Error capturando el pokemon',
        description: "El pokemon ya fue capturado anteriormente",
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top-right'
      })
    }
  };


  //Funcion para rotar la pokebola al momento de atrapar al pokemon
  const rotatePokeball = (pokemon) => {
    const pokeball = document.getElementById('pokeball');

    let totalRotation = 0;
    const rotationInterval = 100; // Ajusta este valor según la suavidad de la rotación
    const rotationsToComplete = 5;
    const rotationIncrement = 360 / rotationsToComplete;

    const rotateInterval = setInterval(() => {
      totalRotation += rotationIncrement;
      pokeball.style.transform = `rotate(${totalRotation}deg)`;

      // Detener la rotación después de completar las 5 rotaciones
      if (totalRotation >= 360 * rotationsToComplete) {
        clearInterval(rotateInterval);
        handleSaveData({ pokemon: pokemon })
        // Ajusta este valor según la duración de la pausa después de la rotación
      }
    }, rotationInterval);
  }

  return (
    <Stack style={{ background: backgrounds.find(item => item.name === pokemon.types[0].type.name)?.background }} spacing="5">
      <Stack spacing="5" position="relative">
        <Text textAlign="start" className="ml-4 mt-4 mb-0" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }} textTransform="Capitalize">{pokemon.name}</Text>
        <div className="d-flex">
          {pokemon.types.map((item, key) => <Tag key={key} style={{ borderRadius: '2rem', fontSize: '1rem', color: 'gray', textAlign: 'center' }} className="w-auto ml-4 d-flex justify-content-center">{item.type.name}</Tag>)}
        </div>
        <div className="w-100 d-flex justify-content-start position-relative">
          <Image
            alt='Pokemon'
            style={{ marginBottom: '-2.5rem', zIndex: 1111, position: 'absolute', bottom: 0, right: 0 }}
            src={`https://images.wikidexcdn.net/mwuploads/esssbwiki/thumb/5/50/latest/20201020223237/S%C3%ADmbolo_Pok%C3%A9mon_%28Melee%29.png/180px-S%C3%ADmbolo_Pok%C3%A9mon_%28Melee%29.png`}
          />
          <Image
            alt='Pokemon'
            style={{ marginBottom: '-2.5rem', zIndex: 9999 }}
            w={80}
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.id}.png`}
          />
        </div>
        <Card style={{ borderRadius: '3rem 3rem 0 0' }} >
          <Tabs className=" p-3 align-items-center">
            <TabList>
              <Tab>About</Tab>
              <Tab>Stats</Tab>
            </TabList>
            <TabPanels>
              <TabPanel className="pb-0">
                <Row className="mt-4  align-items-center">
                  <Col className="mb-4" lg='3'>
                    <h6 className="mb-0" style={{ color: 'gray' }} fontSize="xs">Height</h6>
                  </Col>
                  <Col className="mb-4" lg='8'>
                    <h6 className="mb-0" style={{ fontWeight: 'bold' }} fontSize="xs">{pokemon.height}</h6>
                  </Col>
                  <Col className="mb-4" lg='3'>
                    <h6 className="mb-0" style={{ color: 'gray' }} fontSize="xs">Weight</h6>
                  </Col>
                  <Col className="mb-4" lg='8'>
                    <h6 className="mb-0" style={{ fontWeight: 'bold' }} fontSize="xs">{pokemon.weight}</h6>
                  </Col>
                  <Col className="mb-4" lg='3'>
                    <h6 className="mb-0" style={{ color: 'gray' }} fontSize="xs">Abilities</h6>
                  </Col>
                  <Col className="mb-4" lg='8'>
                    <h6 className="mb-0" style={{ fontWeight: 'bold' }} fontSize="xs">{pokemon.abilities.map((item, key) => (pokemon.abilities.length !== key + 1 ? item.ability.name + ', ' : item.ability.name))} </h6>
                  </Col>
                </Row>
              </TabPanel>
              <TabPanel className="pb-0">
                {pokemon.stats.map((item, key) =>
                  <Row key={key} className="mt-4 p-2 align-items-center">
                    <Col lg='4'>
                      <h6 className="mb-0" fontSize="xs">{item.stat.name}</h6>
                    </Col>
                    <Col lg='2'>
                      <h6 className="mb-0" style={{ fontWeight: 'bold' }} fontSize="xs">{item.base_stat}</h6>
                    </Col>
                    <Col lg='6'>
                      <Progress bg="gray.300" borderRadius="full" value={item.base_stat} />
                    </Col>
                  </Row>
                )}
              </TabPanel>

            </TabPanels>
          </Tabs>
          {tabIndex === 1 ?
            <div className="w-100 d-flex justify-content-center position-relative">
              <Button onClick={() => deletePokemon(pokemon)} style={{ background: backgrounds.find(item => item.name === pokemon.types[0].type.name)?.background, color: 'white' }}> Liberar pokemon</Button>
            </div>
            :
            <div className="w-100 d-flex justify-content-center position-relative">
              <div style={{ cursor: 'pointer' }} onClick={() => rotatePokeball(pokemon)} id="pokeball" class="pokebola">
                <div class="pokebola-botao">
                </div>
              </div>
            </div>
          }
        </Card>
      </Stack>
    </Stack >
  );
}
