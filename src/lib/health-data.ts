export interface HealthDataItem {
  id: string;
  title: string;
  description: string;
  date?: string;
  location?: string;
  source?: string;
  url?: string;
  image?: string;
}

export const mockHealthData = {
  insurance: [
    {
      id: '1',
      title: 'Ayushman Bharat - PMJAY',
      description: 'Provides health coverage of ₹5 lakh per family per year for secondary and tertiary care hospitalization.',
      source: 'Government of India',
      url: 'https://pmjay.gov.in',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=150&fit=crop'
    },
    {
      id: '2', 
      title: 'ESIC Medical Benefits',
      description: 'Comprehensive medical care for employees and their dependents under Employee State Insurance Corporation.',
      source: 'ESIC',
      url: 'https://esic.nic.in',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&h=150&fit=crop'
    },
    {
      id: '3',
      title: 'CGHS (Central Government Health Scheme)',
      description: 'Medical care facilities for Central Government employees, pensioners and their dependents.',
      source: 'Ministry of Health',
      url: 'https://cghs.nic.in',
      image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=300&h=150&fit=crop'
    }
  ],
  subsidies: [
    {
      id: '1',
      title: 'Janani Suraksha Yojana',
      description: 'Cash assistance to pregnant women for institutional delivery and post-delivery care.',
      source: 'Ministry of Health & Family Welfare'
    },
    {
      id: '2',
      title: 'Rashtriya Swasthya Bima Yojana',
      description: 'Health insurance coverage for families below poverty line with cashless treatment.',
      source: 'Government of India'
    },
    {
      id: '3',
      title: 'Mission Indradhanush',
      description: 'Free vaccination program covering 12 vaccine-preventable diseases for children and pregnant women.',
      source: 'Ministry of Health'
    }
  ],
  camps: [
    {
      id: '1',
      title: 'Free Eye Check-up Camp',
      description: 'Comprehensive eye examination and free spectacles distribution.',
      date: '2024-02-15',
      location: 'Community Health Center, Sector 15',
      image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=300&h=150&fit=crop'
    },
    {
      id: '2',
      title: 'Diabetes Screening Camp',
      description: 'Free blood sugar testing and consultation with endocrinologist.',
      date: '2024-02-20',
      location: 'District Hospital, Main Road'
    },
    {
      id: '3',
      title: 'Women Health Awareness',
      description: 'Cervical cancer screening and reproductive health consultation.',
      date: '2024-02-25',
      location: 'Primary Health Center, Block A'
    }
  ],
  events: [
    {
      id: '1',
      title: 'World Heart Day Celebration',
      description: 'Free cardiac screening, ECG tests, and heart health awareness sessions.',
      date: '2024-02-18',
      location: 'City Hospital Auditorium'
    },
    {
      id: '2',
      title: 'Mental Health Workshop',
      description: 'Stress management techniques and counseling sessions by certified psychologists.',
      date: '2024-02-22',
      location: 'Medical College Conference Hall'
    }
  ],
  yoga: [
    {
      id: '1',
      title: '5 Morning Yoga Poses for Better Health',
      description: 'Start your day with these simple yoga poses that boost energy and improve flexibility.',
      source: 'Yoga Alliance',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=150&fit=crop'
    },
    {
      id: '2',
      title: 'Breathing Exercises for Stress Relief',
      description: 'Learn pranayama techniques to reduce anxiety and improve mental clarity.',
      source: 'International Yoga Federation'
    },
    {
      id: '3',
      title: 'Meditation for Better Sleep',
      description: 'Guided meditation practices to improve sleep quality and reduce insomnia.',
      source: 'Mindfulness Institute'
    }
  ],
  nutrition: [
    {
      id: '1',
      title: 'Top 10 Immunity Boosting Foods',
      description: 'Include these nutrient-rich foods in your diet to strengthen your immune system naturally.',
      source: 'National Institute of Nutrition',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=150&fit=crop'
    },
    {
      id: '2',
      title: 'Healthy Meal Planning for Diabetics',
      description: 'Expert tips on creating balanced meals that help manage blood sugar levels effectively.',
      source: 'Indian Dietetic Association'
    },
    {
      id: '3',
      title: 'Hydration: How Much Water Do You Need?',
      description: 'Understanding daily water requirements and signs of proper hydration for optimal health.',
      source: 'WHO Guidelines'
    }
  ]
};

export const fetchHealthData = async (type: keyof typeof mockHealthData): Promise<HealthDataItem[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockHealthData[type] || [];
};