import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useBudget } from '@/hooks/use-budget';
import { formatEuro } from '@/constants/formatters';
import { isChargeActiveInMonth, addMonthsToMonthStr, getCurrentMonthStr } from '@/utils/fixed-expenses';
import { computeSavings } from '@/constants/breakdown';

export function BudgetTrendChart(): React.JSX.Element {
  const { budget, fixedExpensesList, totalEstimatedVariable } = useBudget();
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  // French 3-letter month abbreviations without trailing period for clean mobile layout
  const SHORT_MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  // Compute 12-month projections
  const points = useMemo(() => {
    const currentBase = getCurrentMonthStr();
    const result: Array<{
      monthStr: string;
      label: string;
      fullMonthLabel: string;
      resteAVivre: number;
      epargne: number;
    }> = [];

    for (let offset = 0; offset <= 11; offset++) {
      const monthStr = addMonthsToMonthStr(currentBase, offset);
      const activeFixedSum = fixedExpensesList
        .filter((item) => isChargeActiveInMonth(item, monthStr, currentBase))
        .reduce((sum, item) => sum + item.amount, 0);

      const income = budget.income;
      const reste = Math.max(0, income - activeFixedSum);
      const targetNec = budget.isCustomTargetNecessary && budget.targetNecessary !== undefined
        ? budget.targetNecessary
        : totalEstimatedVariable;
      const epargne = computeSavings(reste, targetNec);

      const monthIndex = parseInt(monthStr.slice(5, 7), 10) - 1;
      const shortLabel = SHORT_MONTHS[monthIndex] ?? monthStr.slice(5, 7);
      const dateObj = new Date(Date.UTC(parseInt(monthStr.slice(0, 4), 10), monthIndex, 1));
      const fullMonthLabel = dateObj.toLocaleDateString('fr-FR', { month: 'long' });

      result.push({
        monthStr,
        label: shortLabel,
        fullMonthLabel,
        resteAVivre: Math.round(reste),
        epargne: Math.round(epargne),
      });
    }
    return result;
  }, [budget, fixedExpensesList, totalEstimatedVariable]);

  // SVG Geometry
  const chartWidth = Math.min(Dimensions.get('window').width - 64, 700);
  const chartHeight = 110;
  const paddingX = 16;
  const paddingY = 16;

  const minVal = Math.min(...points.map((p) => p.resteAVivre), 0);
  const maxVal = Math.max(...points.map((p) => p.resteAVivre), 100);
  const range = maxVal - minVal || 1;

  const coords = useMemo(() => {
    const stepX = (chartWidth - paddingX * 2) / (points.length - 1);
    return points.map((p, idx) => {
      const x = paddingX + idx * stepX;
      const y = chartHeight - paddingY - ((p.resteAVivre - minVal) / range) * (chartHeight - paddingY * 2);
      return { x, y, ...p };
    });
  }, [points, chartWidth, minVal, range]);

  // Construct SVG Path
  const { linePath, areaPath } = useMemo(() => {
    if (coords.length === 0) return { linePath: '', areaPath: '' };
    let line = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const cur = coords[i];
      const cpX1 = prev.x + (cur.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (cur.x - prev.x) / 2;
      const cpY2 = cur.y;
      line += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${cur.x} ${cur.y}`;
    }
    const last = coords[coords.length - 1];
    const area = `${line} L ${last.x} ${chartHeight} L ${coords[0].x} ${chartHeight} Z`;
    return { linePath: line, areaPath: area };
  }, [coords]);

  const activePoint = coords[selectedIdx] || coords[0];

  return (
    <View className="bg-card border border-border/80 rounded-3xl p-4 sm:p-5 shadow-xs">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-xl bg-accent/10 items-center justify-center">
            <Ionicons name="trending-up" size={17} color="#22c55e" />
          </View>
          <View>
            <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Projection sur 12 Mois
            </Text>
            <Text className="text-sm font-black text-foreground">
              Trajectoire Reste à Vivre
            </Text>
          </View>
        </View>

        {/* Selected badge */}
        <View className="bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
          <Text className="text-xs font-bold text-primary">
            {activePoint.fullMonthLabel.toUpperCase()} : {formatEuro(activePoint.resteAVivre)}
          </Text>
        </View>
      </View>

      {/* SVG Curve */}
      <View className="items-center my-1">
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
            </LinearGradient>
          </Defs>
          <Path d={areaPath} fill="url(#chartGradient)" />
          <Path d={linePath} fill="none" stroke="#22c55e" strokeWidth={2.5} />
          {coords.map((pt, idx) => (
            <Circle
              key={pt.monthStr}
              cx={pt.x}
              cy={pt.y}
              r={selectedIdx === idx ? 5 : 2.5}
              fill={selectedIdx === idx ? '#22c55e' : '#94a3b8'}
              stroke={selectedIdx === idx ? '#ffffff' : 'none'}
              strokeWidth={selectedIdx === idx ? 2 : 0}
              onPress={() => setSelectedIdx(idx)}
            />
          ))}
        </Svg>
      </View>

      {/* Month Steppers Pills - Exactly positioned below each chart point */}
      <View
        style={{ width: chartWidth, height: 30 }}
        className="relative pt-1 border-t border-border/40 self-center"
      >
        {coords.map((pt, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <TouchableOpacity
              key={pt.monthStr}
              onPress={() => setSelectedIdx(idx)}
              hitSlop={{ top: 10, bottom: 12, left: 4, right: 4 }}
              style={{ position: 'absolute', left: pt.x - 14, width: 28, top: 4 }}
              className="items-center justify-center"
            >
              <View
                className={`px-1 py-0.5 rounded-full items-center justify-center ${
                  isSelected ? 'bg-primary' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`text-[9px] font-bold ${
                    isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {pt.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
