export const cities = [
  'Agra',
  'Ahmedabad',
  'Amritsar',
  'Bengaluru',
  'Bhopal',
  'Bhubaneswar',
  'Chandigarh',
  'Chennai',
  'Coimbatore',
  'Dehradun',
  'Delhi',
  'Faridabad',
  'Ghaziabad',
  'Goa',
  'Gurugram',
  'Guwahati',
  'Hyderabad',
  'Indore',
  'Jaipur',
  'Jodhpur',
  'Kanpur',
  'Kochi',
  'Kolkata',
  'Lucknow',
  'Ludhiana',
  'Madurai',
  'Mangaluru',
  'Meerut',
  'Mumbai',
  'Mysuru',
  'Nagpur',
  'Nashik',
  'Noida',
  'Patna',
  'Pune',
  'Raipur',
  'Rajkot',
  'Ranchi',
  'Surat',
  'Thane',
  'Thiruvananthapuram',
  'Udaipur',
  'Vadodara',
  'Varanasi',
  'Vijayawada',
  'Visakhapatnam',
];

export function matchCities(query: string, limit = 5) {
  const text = query.trim().toLowerCase();
  if (!text) {
    return [];
  }
  const starts = cities.filter(name => name.toLowerCase().startsWith(text));
  const rest = cities.filter(name => !name.toLowerCase().startsWith(text) && name.toLowerCase().includes(text));
  return [...starts, ...rest].slice(0, limit);
}

export function cityName(value: string) {
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return cities.find(name => name.toLowerCase() === trimmed.toLowerCase()) ?? trimmed;
}

export function isListedCity(value: string) {
  const text = value.trim().toLowerCase();
  return text.length > 0 && cities.some(name => name.toLowerCase() === text);
}
