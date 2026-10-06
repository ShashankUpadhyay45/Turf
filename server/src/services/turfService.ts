export const getTurfs = async (query: any, sport?: string, area?: string, minRating?: number, maxPrice?: number) => {
  return [
    { id: 't1', name: 'Champions Arena', sport: 'football', area: 'North', rating: 4.5, price: 1000 },
    { id: 't2', name: 'Skyline', sport: 'cricket', area: 'South', rating: 4.8, price: 1500 }
  ];
};

export const getTurfById = async (id: string) => {
  return { id, name: 'Champions Arena', sport: 'football' };
};

export const createTurf = async (data: any, ownerId: string) => {
  return { id: 't3', ...data, ownerId };
};

export const updateTurf = async (id: string, data: any, ownerId: string) => {
  return { id, ...data, ownerId };
};
