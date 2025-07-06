const initialProfile1Routes = [
  ...Array.from({ length: 74 }, (_, i) => ({
    route: `/profile/profile1/${i}.png`,
    name: `${i}`,
  })),
];

export default initialProfile1Routes;
