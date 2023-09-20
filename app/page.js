import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Text
} from '@chakra-ui/react';

import { RedeemBox } from './components/RedeemBox';
import { WithdrawCollateral } from './components/WithdrawCollateral';
import { ArrowRightCircle } from 'lucide-react';

export default function Home() {
  return (
    <Flex direction='column'>
      <Flex direction='column' my='2rem'>
        <Text fontSize={{ lg: '28px', sm: '18px' }} mb='1rem'>
          Global Settlement
        </Text>
        <Text fontSize={{ lg: '16px', sm: '14px' }} maxW='800px' opacity='0.7'>
          In case of an emergency protocol shutdown, you can withdraw any excess
          collateral & redeem system coins below.
        </Text>
      </Flex>

      <Tabs
        variant='unstyled'
        display='flex'
        flexDirection='row'
        alignItems='center'
        justifyContent='center'
        my='2rem'
        isFitted
      >
        <TabList display='flex' flexDirection='column' w='50%' minH='350px'>
          <Tab _selected={{ color: 'white', bg: 'rgb(5, 25, 46)' }} h='150px'>
            <Text mr='1rem'> Withdraw Collateral</Text>
            <ArrowRightCircle />
          </Tab>
          <Tab _selected={{ color: 'white', bg: 'rgb(5, 25, 46)' }} h='150px'>
            <Text mr='1rem'>Redeem System Coins </Text>
            <ArrowRightCircle />
          </Tab>
        </TabList>

        <TabPanels
          minH='350px'
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          border='2px solid rgb(5, 25, 46)'
          bg='rgb(5, 25, 46)'
        >
          <TabPanel>
            <WithdrawCollateral />
          </TabPanel>
          <TabPanel>
            <RedeemBox />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}
