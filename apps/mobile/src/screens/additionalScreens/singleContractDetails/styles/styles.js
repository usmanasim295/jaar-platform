import {StyleSheet} from 'react-native';
import {Layout} from '../../../../generalStyles/layout';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../../utils/helpers';
import {Fonts} from '../../../../generalStyles/fontStyles';
import {Colors} from '../../../../generalStyles/theme';

export const styles = StyleSheet.create({
  container: {...Layout.container, ...Layout.generalPaddingHorizontal},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  backButton: {padding: 5},
  headerTitle: {fontSize: 18, fontWeight: '600', color: '#000'},

  coverImage: {
    width: '100%',
    height: HEIGHT_BASE_RATIO(93),
    marginTop: HEIGHT_BASE_RATIO(24),
    justifyContent: 'center',
  },

  contractorInfo: {marginTop: 10},
  contractorName: {fontSize: 18, fontWeight: '700', color: '#000'},
  locationRow: {flexDirection: 'row', alignItems: 'center', marginTop: 5},
  locationText: {fontSize: 14, color: '#555', marginLeft: 5},

  card: {
    backgroundColor: Colors.White,
    padding: FONT_SIZE(16),
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: {width: 1, height: 2},
    shadowRadius: 5,
    elevation: 2,
  },
  statsHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  statsTitle: {
    ...Fonts.Jakarta_Sans_SemiBold_16_Primary,
    marginLeft: 5,
  },
  ratingRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  ratingText: {...Fonts.Jakarta_Sans_Medium_12_Black, marginLeft: 5},

  statsRow: {
    flexDirection: 'row',
    marginBottom: 10,
    columnGap: WIDTH_BASE_RATIO(40),
  },
  statItem: {alignItems: 'flex-start'},
  statValue: {...Fonts.Jakarta_Sans_SemiBold_16_Primary},
  statLabel: {...Fonts.Jakarta_Sans_Regular_12_Black},

  responseTime: {...Fonts.Jakarta_Sans_Medium_14_Black},
  subText: {...Fonts.Jakarta_Sans_light_14_Black},

  section: {marginTop: 15},
  sectionTitle: {
    ...Fonts.Jakarta_Sans_SemiBold_16_Primary,
    marginBottom: 5,
  },
  sectionText: {...Fonts.Jakarta_Sans_Regular_14_Black},
  seeMore: {...Fonts.Jakarta_Sans_Regular_14_Grey},

  docButton: {
    backgroundColor: Colors.GhostWhite,
    paddingVertical: HEIGHT_BASE_RATIO(18),
    paddingHorizontal: WIDTH_BASE_RATIO(16),
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: HEIGHT_BASE_RATIO(16),
  },
  docText: {fontSize: 14, color: '#000', marginLeft: 8},
  imgtext: {
    ...Fonts.Jakarta_Sans_SemiBold_16_White,
    marginLeft: WIDTH_BASE_RATIO(24),
  },
  upperText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: WIDTH_BASE_RATIO(24),
    marginTop: HEIGHT_BASE_RATIO(6),
  },
  textDetails: {
    ...Fonts.Jakarta_Sans_Regular_12_White,
  },
  recomendationDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: WIDTH_BASE_RATIO(5),
  },
  price: {
    ...Fonts.Jakarta_Sans_Regular_14_Black,
  },
  styleleader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: HEIGHT_BASE_RATIO(24),
    columnGap: WIDTH_BASE_RATIO(16),
  },
  styleleaderBtn: {
    flex: 1,
    height: HEIGHT_BASE_RATIO(60),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.Primary,
    borderRadius: 12,
  },
  leaderBtnText: {
    ...Fonts.Jakarta_Sans_SemiBold_16_White,
  },
  textstyle: {paddingBottom: HEIGHT_BASE_RATIO(40)},
});
