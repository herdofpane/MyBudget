import { StyleSheet, Platform } from 'react-native';

export const homeStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: 16,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    marginTop: 2,
  },
  editHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  editHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#38bdf8',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 30,
    gap: 20,
  },

  /* 1. CARTE PATRIMOINE */
  patrimonyCard: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  patrimonyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  patrimonyAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  patrimonyDivider: {
    height: 1,
    backgroundColor: '#1f2937',
    marginVertical: 16,
  },
  accountsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountItemLeft: {
    paddingRight: 8,
  },
  accountItemRight: {
    paddingLeft: 8,
  },
  accountIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingsIconWrapper: {
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
  },
  accountInfo: {
    flex: 1,
  },
  accountLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  accountAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f1f5f9',
    marginTop: 2,
  },
  savingsAmountText: {
    color: '#34d399',
  },
  verticalSeparator: {
    width: 1,
    height: 38,
    backgroundColor: '#1f2937',
  },

  /* 2. SECTION FLUX */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.3,
  },
  sectionHint: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  sectionBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    backgroundColor: '#1e293b',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  cashflowRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cashflowCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  incomeCard: {
    backgroundColor: '#0c1f1a',
    borderColor: '#064e3b',
  },
  expenseCard: {
    backgroundColor: '#201016',
    borderColor: '#4c0519',
  },
  cashflowCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cashflowIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomeIconBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  expenseIconBg: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
  },
  cashflowTagIncome: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
    textTransform: 'uppercase',
  },
  cashflowTagExpense: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f43f5e',
    textTransform: 'uppercase',
  },
  cashflowLabel: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  incomeAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10b981',
    marginTop: 4,
    marginBottom: 4,
  },
  expenseAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fb7185',
    marginTop: 4,
    marginBottom: 4,
  },
  cashflowSubtext: {
    fontSize: 11,
    color: '#64748b',
  },

  /* 3. CARTE RESTE À VIVRE */
  allowanceCard: {
    backgroundColor: '#161928',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2e2554',
  },
  allowanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  allowanceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  allowanceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  allowanceRatio: {
    fontSize: 12,
    fontWeight: '700',
    color: '#c084fc',
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  allowanceBody: {
    marginVertical: 12,
  },
  allowanceAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#a78bfa',
    letterSpacing: -0.5,
  },
  allowanceDescription: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 3,
  },
  gaugeContainer: {
    marginTop: 4,
    gap: 6,
  },
  gaugeBackground: {
    height: 8,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  gaugeFilled: {
    height: '100%',
    backgroundColor: '#f43f5e',
    borderRadius: 4,
  },
  gaugeLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gaugeLegendText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },

  /* 4. LISTE DES CHARGES FIXES */
  expenseListContainer: {
    backgroundColor: '#111827',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  expenseListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  noBorderBottom: {
    borderBottomWidth: 0,
  },
  expenseListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  expenseItemIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  expenseItemCategory: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'capitalize',
    marginTop: 1,
  },
  expenseItemAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f43f5e',
  },

  /* BOUTON PRINCIPAL */
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 15,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },

  /* MODAL D'ÉDITION */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 3,
  },
  modalCloseButton: {
    padding: 6,
    backgroundColor: '#1e293b',
    borderRadius: 20,
  },
  modalBody: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  textInput: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
    height: 50,
  },
  textInputFocused: {
    borderColor: '#38bdf8',
    backgroundColor: '#1e293b',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  modalSubmitButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#0284c7',
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
