//@ts-ignore
export default (ctx: any, config: any, { strapi }: any) => {
  console.log('We are in a policy');

  return false;
};
