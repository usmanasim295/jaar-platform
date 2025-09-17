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
  container: {
    ...Layout.container,
    ...Layout.generalPaddingHorizontal,
  },
  contentContainerPadding: {
    paddingTop: HEIGHT_BASE_RATIO(24),
    paddingBottom: HEIGHT_BASE_RATIO(200),
  },
  paymentMethod: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: HEIGHT_BASE_RATIO(66),
    paddingHorizontal: WIDTH_BASE_RATIO(16),
    borderRadius: 10,
    backgroundColor: Colors.White,
    // iOS Shadow
    shadowColor: Colors.Grey,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android Shadow
    elevation: 3,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: WIDTH_BASE_RATIO(10),
  },
  textContainer: {
    marginTop: HEIGHT_BASE_RATIO(24),
    rowGap: HEIGHT_BASE_RATIO(16),
  },
  paymentLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    ...Fonts.Jakarta_Sans_Regular_16_Black,
  },
  paymentValue: {
    ...Fonts.Jakarta_Sans_Bold_16_Black,
  },
  swipeToPayContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: Colors.White,
    ...Layout.generalPaddingHorizontal,
  },
  switch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: HEIGHT_BASE_RATIO(24),
  },
  warningCard: {
    marginTop: HEIGHT_BASE_RATIO(24),
    padding: HEIGHT_BASE_RATIO(16),
    borderRadius: 10,
    backgroundColor: Colors.Stroke,
  },
  billContractCard: {
    width: '98%',
    alignSelf: 'center',
    backgroundColor: Colors.White,
    marginTop: HEIGHT_BASE_RATIO(16),
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
  cardTopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.Stroke,
    marginVertical: HEIGHT_BASE_RATIO(16),
  },
});
