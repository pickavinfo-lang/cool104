import { Image, Pressable, StyleSheet } from 'react-native';
import { Card, CardRank, CardSuit } from '../types';

interface PlayingCardProps {
  card: Card;
  onPress?: () => void;
  disabled?: boolean;
  size?: 'small' | 'large';
  customSize?: { width: number; height: number };
}

const SUIT_FILE: Record<CardSuit, string> = {
  '♠': 'spades',
  '♥': 'hearts',
  '♦': 'diamonds',
  '♣': 'clubs',
};

const RANK_FILE: Record<CardRank, string> = {
  A: 'ace',
  '2': '02',
  '3': '03',
  '4': '04',
  '5': '05',
  '6': '06',
  '7': '07',
  '8': '08',
  '9': '09',
  '10': '10',
  J: 'jack',
  Q: 'queen',
  K: 'king',
};

// require() needs a static, literal path per file — so every card face is enumerated here
// rather than built from a template string.
const CARD_FACES: Record<string, ReturnType<typeof require>> = {
  spades_ace: require('../../assets/cards/spades_ace.png'),
  spades_02: require('../../assets/cards/spades_02.png'),
  spades_03: require('../../assets/cards/spades_03.png'),
  spades_04: require('../../assets/cards/spades_04.png'),
  spades_05: require('../../assets/cards/spades_05.png'),
  spades_06: require('../../assets/cards/spades_06.png'),
  spades_07: require('../../assets/cards/spades_07.png'),
  spades_08: require('../../assets/cards/spades_08.png'),
  spades_09: require('../../assets/cards/spades_09.png'),
  spades_10: require('../../assets/cards/spades_10.png'),
  spades_jack: require('../../assets/cards/spades_jack.png'),
  spades_queen: require('../../assets/cards/spades_queen.png'),
  spades_king: require('../../assets/cards/spades_king.png'),
  hearts_ace: require('../../assets/cards/hearts_ace.png'),
  hearts_02: require('../../assets/cards/hearts_02.png'),
  hearts_03: require('../../assets/cards/hearts_03.png'),
  hearts_04: require('../../assets/cards/hearts_04.png'),
  hearts_05: require('../../assets/cards/hearts_05.png'),
  hearts_06: require('../../assets/cards/hearts_06.png'),
  hearts_07: require('../../assets/cards/hearts_07.png'),
  hearts_08: require('../../assets/cards/hearts_08.png'),
  hearts_09: require('../../assets/cards/hearts_09.png'),
  hearts_10: require('../../assets/cards/hearts_10.png'),
  hearts_jack: require('../../assets/cards/hearts_jack.png'),
  hearts_queen: require('../../assets/cards/hearts_queen.png'),
  hearts_king: require('../../assets/cards/hearts_king.png'),
  diamonds_ace: require('../../assets/cards/diamonds_ace.png'),
  diamonds_02: require('../../assets/cards/diamonds_02.png'),
  diamonds_03: require('../../assets/cards/diamonds_03.png'),
  diamonds_04: require('../../assets/cards/diamonds_04.png'),
  diamonds_05: require('../../assets/cards/diamonds_05.png'),
  diamonds_06: require('../../assets/cards/diamonds_06.png'),
  diamonds_07: require('../../assets/cards/diamonds_07.png'),
  diamonds_08: require('../../assets/cards/diamonds_08.png'),
  diamonds_09: require('../../assets/cards/diamonds_09.png'),
  diamonds_10: require('../../assets/cards/diamonds_10.png'),
  diamonds_jack: require('../../assets/cards/diamonds_jack.png'),
  diamonds_queen: require('../../assets/cards/diamonds_queen.png'),
  diamonds_king: require('../../assets/cards/diamonds_king.png'),
  clubs_ace: require('../../assets/cards/clubs_ace.png'),
  clubs_02: require('../../assets/cards/clubs_02.png'),
  clubs_03: require('../../assets/cards/clubs_03.png'),
  clubs_04: require('../../assets/cards/clubs_04.png'),
  clubs_05: require('../../assets/cards/clubs_05.png'),
  clubs_06: require('../../assets/cards/clubs_06.png'),
  clubs_07: require('../../assets/cards/clubs_07.png'),
  clubs_08: require('../../assets/cards/clubs_08.png'),
  clubs_09: require('../../assets/cards/clubs_09.png'),
  clubs_10: require('../../assets/cards/clubs_10.png'),
  clubs_jack: require('../../assets/cards/clubs_jack.png'),
  clubs_queen: require('../../assets/cards/clubs_queen.png'),
  clubs_king: require('../../assets/cards/clubs_king.png'),
};

export const CARD_BACK = require('../../assets/cards/back01.png');

const cardImageSource = (card: Card) => CARD_FACES[`${SUIT_FILE[card.suit]}_${RANK_FILE[card.rank]}`];

export const PlayingCard = ({ card, onPress, disabled, size = 'small', customSize }: PlayingCardProps) => {
  const isLarge = size === 'large';
  const dimensions = customSize ?? (isLarge ? styles.cardLarge : styles.card);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={[styles.card, dimensions, disabled && styles.cardDisabled]}
    >
      <Image source={cardImageSource(card)} style={styles.image} resizeMode="contain" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 76,
    height: 106,
  },
  cardLarge: {
    width: 112,
    height: 156,
  },
  cardDisabled: {
    opacity: 0.4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
