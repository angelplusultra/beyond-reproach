export default {
  async validateZipCode(ctx: any, next: any) {
    const whitelist = new Map([
      ['92808', true],
      ['88756', true],
      ['55764', true]
    ]);
    console.log(ctx.request.body);

    if (!whitelist.get(ctx.request.body.zipcode)) {
      return ctx.badRequest('Invalid zipcode');
    }
    await next();
  }
};
