'use client';

import { useState, useEffect } from 'react';
import { 
  UserGroupIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleChart } from '@/components/charts/simple-chart';

interface Patient {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  medicalHistory: string[];
  lastVisit: string;
  nextAppointment?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'AT_RISK';
  bloodType?: string;
  allergies: string[];
}

interface PatientsStatsProps {
  patients: Patient[];
}

export function PatientsStats({ patients }: PatientsStatsProps) {
  const [statsData, setStatsData] = useState({
    totalPatients: 0,
    activePatients: 0,
    atRiskPatients: 0,
    inactivePatients: 0,
    averageAge: 0,
    mostCommonConditions: [] as { condition: string; count: number }[],
    bloodTypeDistribution: [] as { bloodType: string; count: number }[],
    monthlyVisits: [] as { month: string; visits: number }[],
    ageDistribution: [] as { ageGroup: string; count: number }[],
  });

  useEffect(() => {
    if (patients.length === 0) return;

    // Calculer les statistiques de base
    const totalPatients = patients.length;
    const activePatients = patients.filter(p => p.status === 'ACTIVE').length;
    const atRiskPatients = patients.filter(p => p.status === 'AT_RISK').length;
    const inactivePatients = patients.filter(p => p.status === 'INACTIVE').length;

    // Calculer l'âge moyen
    const totalAge = patients.reduce((sum, patient) => {
      const today = new Date();
      const birthDate = new Date(patient.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return sum + age;
    }, 0);
    const averageAge = totalPatients > 0 ? Math.round(totalAge / totalPatients) : 0;

    // Analyser les conditions médicales les plus courantes
    const conditionCounts: { [key: string]: number } = {};
    patients.forEach(patient => {
      patient.medicalHistory.forEach(condition => {
        conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
      });
    });
    const mostCommonConditions = Object.keys(conditionCounts)
      .map(condition => ({ condition, count: conditionCounts[condition] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Analyser la distribution des groupes sanguins
    const bloodTypeCounts: { [key: string]: number } = {};
    patients.forEach(patient => {
      if (patient.bloodType) {
        bloodTypeCounts[patient.bloodType] = (bloodTypeCounts[patient.bloodType] || 0) + 1;
      }
    });
    const bloodTypeDistribution = Object.keys(bloodTypeCounts)
      .map(bloodType => ({ bloodType, count: bloodTypeCounts[bloodType] }))
      .sort((a, b) => b.count - a.count);

    // Analyser les visites mensuelles basées sur les données réelles
    const currentDate = new Date();
    const monthlyVisits = [];
    
    // Générer les 6 derniers mois avec des données basées sur les patients réels
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = monthDate.toLocaleDateString('fr-FR', { month: 'short' });
      
      // Filtrer les patients qui ont eu une visite ce mois
      const monthPatients = patients.filter(patient => {
        const lastVisitDate = new Date(patient.lastVisit);
        return lastVisitDate.getMonth() === monthDate.getMonth() && 
               lastVisitDate.getFullYear() === monthDate.getFullYear();
      });
      
      monthlyVisits.push({
        month: monthName,
        visits: monthPatients.length
      });
    }

    // Analyser la distribution par âge
    const ageGroups = {
      '0-18': 0,
      '19-35': 0,
      '36-50': 0,
      '51-65': 0,
      '65+': 0,
    };

    patients.forEach(patient => {
      const today = new Date();
      const birthDate = new Date(patient.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 35) ageGroups['19-35']++;
      else if (age <= 50) ageGroups['36-50']++;
      else if (age <= 65) ageGroups['51-65']++;
      else ageGroups['65+']++;
    });

    const ageDistribution = Object.keys(ageGroups)
      .map(ageGroup => ({ ageGroup, count: ageGroups[ageGroup as keyof typeof ageGroups] }));

    setStatsData({
      totalPatients,
      activePatients,
      atRiskPatients,
      inactivePatients,
      averageAge,
      mostCommonConditions,
      bloodTypeDistribution,
      monthlyVisits,
      ageDistribution,
    });
  }, [patients]);

  // Calculer les tendances basées sur les données réelles
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
  };

  // Calculer les tendances pour les 30 derniers jours vs les 30 jours précédents
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const recentPatients = patients.filter(p => new Date(p.lastVisit) >= thirtyDaysAgo);
  const previousPatients = patients.filter(p => {
    const date = new Date(p.lastVisit);
    return date >= sixtyDaysAgo && date < thirtyDaysAgo;
  });

  const recentTotal = recentPatients.length;
  const previousTotal = previousPatients.length;
  const recentActive = recentPatients.filter(p => p.status === 'ACTIVE').length;
  const previousActive = previousPatients.filter(p => p.status === 'ACTIVE').length;
  const recentAtRisk = recentPatients.filter(p => p.status === 'AT_RISK').length;
  const previousAtRisk = previousPatients.filter(p => p.status === 'AT_RISK').length;

  // Calculer l'âge moyen des patients récents vs précédents
  const recentAverageAge = recentPatients.length > 0 ? 
    recentPatients.reduce((sum, p) => {
      const age = new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear();
      return sum + age;
    }, 0) / recentPatients.length : 0;
  
  const previousAverageAge = previousPatients.length > 0 ? 
    previousPatients.reduce((sum, p) => {
      const age = new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear();
      return sum + age;
    }, 0) / previousPatients.length : 0;

  const stats = [
    {
      name: 'Total patients',
      value: statsData.totalPatients,
      icon: UserGroupIcon,
      color: 'blue',
      change: calculateTrend(recentTotal, previousTotal),
      changeType: recentTotal >= previousTotal ? 'increase' as const : 'decrease' as const,
    },
    {
      name: 'Patients actifs',
      value: statsData.activePatients,
      icon: HeartIcon,
      color: 'green',
      change: calculateTrend(recentActive, previousActive),
      changeType: recentActive >= previousActive ? 'increase' as const : 'decrease' as const,
    },
    {
      name: 'À risque',
      value: statsData.atRiskPatients,
      icon: ExclamationTriangleIcon,
      color: 'yellow',
      change: calculateTrend(recentAtRisk, previousAtRisk),
      changeType: recentAtRisk <= previousAtRisk ? 'decrease' as const : 'increase' as const,
    },
    {
      name: 'Âge moyen',
      value: `${Math.round(statsData.averageAge)} ans`,
      icon: ChartBarIcon,
      color: 'purple',
      change: recentAverageAge > previousAverageAge ? 
        `+${(recentAverageAge - previousAverageAge).toFixed(1)} ans` : 
        `${(recentAverageAge - previousAverageAge).toFixed(1)} ans`,
      changeType: recentAverageAge >= previousAverageAge ? 'increase' as const : 'decrease' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className={`h-6 w-6 ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'yellow' ? 'text-yellow-600' :
                    stat.color === 'purple' ? 'text-purple-600' :
                    'text-gray-600'
                  }`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.changeType === 'increase' ? (
                          <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                        )}
                        <span className="sr-only">
                          {stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                        </span>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution par âge */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution par âge</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleChart
              data={statsData.ageDistribution.length > 0 ? statsData.ageDistribution.map(item => ({
                label: item.ageGroup,
                value: item.count
              })) : [{ label: 'Aucune donnée', value: 0 }]}
              type="pie"
            />
          </CardContent>
        </Card>

        {/* Visites mensuelles */}
        <Card>
          <CardHeader>
            <CardTitle>Visites mensuelles</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleChart
              data={statsData.monthlyVisits.length > 0 ? statsData.monthlyVisits.map(item => ({
                label: item.month,
                value: item.visits
              })) : [{ label: 'Aucune donnée', value: 0 }]}
              type="line"
            />
          </CardContent>
        </Card>

        {/* Conditions médicales les plus courantes */}
        <Card>
          <CardHeader>
            <CardTitle>Conditions médicales les plus courantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statsData.mostCommonConditions.map((item, index) => (
                <div key={item.condition} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{item.condition}</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${statsData.mostCommonConditions.length > 0 ? (item.count / Math.max(...statsData.mostCommonConditions.map(c => c.count))) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribution des groupes sanguins */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution des groupes sanguins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statsData.bloodTypeDistribution.map((item) => (
                <div key={item.bloodType} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{item.bloodType}</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${statsData.bloodTypeDistribution.length > 0 ? (item.count / Math.max(...statsData.bloodTypeDistribution.map(b => b.count))) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
