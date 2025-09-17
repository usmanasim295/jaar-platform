import {StyleSheet} from 'react-native';
import {Layout} from '../../../../generalStyles/layout';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../../utils/helpers';
import {Colors} from '../../../../generalStyles/theme';
import {Fonts} from '../../../../generalStyles/fontStyles';

export const styles = StyleSheet.create({
  container: {...Layout.container, ...Layout.generalPaddingHorizontal},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: HEIGHT_BASE_RATIO(24),
  },
  billsContainer: {
    marginTop: HEIGHT_BASE_RATIO(8),
    paddingTop: HEIGHT_BASE_RATIO(8),
  },
  tabsContainer: {
    width: '100%',
    padding: FONT_SIZE(4),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    marginTop: HEIGHT_BASE_RATIO(24),
    backgroundColor: Colors.White,
    // iOS Shadow
    shadowColor: Colors.Grey,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android Shadow
    elevation: 3,
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.Stroke,
    marginVertical: HEIGHT_BASE_RATIO(16),
  },
  cardTopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tab: {
    width: '30s%',
    height: HEIGHT_BASE_RATIO(40),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: WIDTH_BASE_RATIO(191),
    height: HEIGHT_BASE_RATIO(122),
    backgroundColor: Colors.White,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: HEIGHT_BASE_RATIO(16),
    // iOS Shadow
    shadowColor: Colors.Grey,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android Shadow
    elevation: 3,
  },
  cardText: {
    marginTop: HEIGHT_BASE_RATIO(16),
    ...Fonts.Jakarta_Sans_SemiBold_14_Black,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  header: {
    ...Fonts.Jakarta_Sans_SemiBold_18_Black,

    justifyContent: 'flex-start',
  },
  viewAll: {
    ...Fonts.Jakarta_Sans_SemiBold_12_Primary,
  },
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: WIDTH_BASE_RATIO(398),
    height: HEIGHT_BASE_RATIO(72),
    borderRadius: 12,
    padding: 12,
    marginBottom: HEIGHT_BASE_RATIO(16),
    // iOS Shadow
    shadowColor: Colors.Grey,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android Shadow
    elevation: 3,
  },
  billIcon: {
    backgroundColor: '#f0f0f0',
    borderRadius: 50,
    padding: 0,
    marginRight: 12,
  },
  billText: {
    ...Fonts.Jakarta_Sans_SemiBold_14_Black,
    flex: 1,
  },
  billPrice: {
    ...Fonts.Jakarta_Sans_Bold_14_Primary,
  },
  billContractCard: {
    width: '98%',
    alignSelf: 'center',
    backgroundColor: Colors.White,
    padding: FONT_SIZE(16),
    borderRadius: 12,
    // iOS Shadow
    shadowColor: Colors.Grey,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android Shadow
    elevation: 3,
  },
  dueDate: {
    marginTop: HEIGHT_BASE_RATIO(7),
    // marginBottom: 12,
    color: '#333',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: WIDTH_BASE_RATIO(10),
  },
  userName: {
    ...Fonts.Jakarta_Sans_Medium_12_Black,
  },
  apartment: {
    ...Fonts.Jakarta_Sans_Regular_12_Grey,
  },
  contractTitle: {
    ...Fonts.Jakarta_Sans_SemiBold_16_Black,
    marginVertical: HEIGHT_BASE_RATIO(16),
  },
  description: {
    ...Fonts.Jakarta_Sans_Regular_14_Grey,
    marginBottom: HEIGHT_BASE_RATIO(16),
  },
  amount: {
    ...Fonts.Jakarta_Sans_SemiBold_16_Primary,
    marginBottom: HEIGHT_BASE_RATIO(16),
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: WIDTH_BASE_RATIO(8),
  },
  tag: {
    backgroundColor: Colors.Stroke,
    padding: FONT_SIZE(10),
    borderRadius: 8,
  },
  reminderBtn: {
    width: WIDTH_BASE_RATIO(108),
    backgroundColor: Colors.Primary,
    padding: FONT_SIZE(10),
    borderRadius: 6,
    marginLeft: 'auto',
  },
  billContractContainer: {
    rowGap: HEIGHT_BASE_RATIO(24),
    marginTop: HEIGHT_BASE_RATIO(24),
  },
});
