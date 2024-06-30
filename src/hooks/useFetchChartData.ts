import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, eachMonthOfInterval, startOfYear, endOfYear } from 'date-fns';
import { db } from '@/app/firebase';

const useFetchChartData = (isVendor: boolean, userId: string) => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [annualData, setAnnualData] = useState([]);
  const [annualTotal, setAnnualTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const q = query(
        collection(db, 'offers'),
        where('status', 'in', ['accepted', 'completed', 'in progress']),
        where(isVendor ? 'vendorId' : 'agentId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const transactions = [];
      querySnapshot.forEach((doc) => {
        transactions.push(doc.data());
      });

      const monthlyGroupedData = transactions.reduce((acc, transaction) => {
        const month = format(new Date(transaction.acceptedAt.toDate()), 'MMMM');
        if (!acc[month]) {
          acc[month] = { value: 0, count: 0 };
        }
        acc[month].value += isVendor ? transaction.vendorCosts : transaction.withoutTax;
        acc[month].count += 1;
        return acc;
      }, {});

      const formattedMonthlyData = Object.keys(monthlyGroupedData).map((month) => ({
        month,
        value: monthlyGroupedData[month].value,
        offers: monthlyGroupedData[month].count,
      }));

      const yearStart = startOfYear(new Date());
      const yearEnd = endOfYear(new Date());

      const annualGroupedData = transactions.reduce((acc, transaction) => {
        const month = format(new Date(transaction.acceptedAt.toDate()), 'MMM');
        if (!acc[month]) {
          acc[month] = [];
        }
        acc[month].push({
          date: new Date(transaction.acceptedAt.toDate()),
          value: isVendor ? transaction.vendorCosts : transaction.withoutTax
        });
        return acc;
      }, {});

      const allMonths = eachMonthOfInterval({ start: yearStart, end: yearEnd });

      let annualSum = 0;
      let annualOfferCount = 0;

      const formattedAnnualData = allMonths.map((monthDate) => {
        const month = format(monthDate, 'MMM');
        const monthTransactions = annualGroupedData[month] || [];

        if (monthTransactions.length === 0) {
          return {
            label: month,
            value1: 0,
            value2: 0,
            value3: 0,
            offers: 0
          };
        }

        monthTransactions.sort((a, b) => a.date - b.date);

        const startOfMonthDate = startOfMonth(monthTransactions[0].date);
        const endOfMonthDate = endOfMonth(monthTransactions[0].date);
        const interval = eachDayOfInterval({ start: startOfMonthDate, end: endOfMonthDate });
        const daysInMonth = interval.length;
        const splitDays = Math.floor(daysInMonth / 3);
        const remainderDays = daysInMonth % 3;

        let part1End = splitDays;
        let part2End = part1End + splitDays + (remainderDays > 0 ? 1 : 0);
        let part3End = daysInMonth;

        let part1Sum = 0, part2Sum = 0, part3Sum = 0;

        for (let i = 0; i < monthTransactions.length; i++) {
          let transactionDate = monthTransactions[i].date.getDate();
          if (transactionDate <= part1End) {
            part1Sum += monthTransactions[i].value;
          } else if (transactionDate <= part2End) {
            part2Sum += monthTransactions[i].value;
          } else {
            part3Sum += monthTransactions[i].value;
          }
        }

        annualSum += (part1Sum + part2Sum + part3Sum);
        annualOfferCount += monthTransactions.length;

        return {
          label: month,
          value1: part1Sum,
          value2: part2Sum,
          value3: part3Sum,
          offers: monthTransactions.length
        };
      });

      setMonthlyData(formattedMonthlyData);
      setAnnualData(formattedAnnualData);
      setAnnualTotal(annualSum);
      setLoading(false);
    };
    
    if (userId)
      fetchData();
  }, [isVendor, userId]);

  console.log({ monthlyData, annualData, annualTotal, loading });

  return { monthlyData, annualData, annualTotal, loading };
};

export default useFetchChartData;