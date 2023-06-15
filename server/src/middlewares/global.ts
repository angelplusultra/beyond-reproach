import { NextFunction } from 'connect';

export default () => {
  return async (ctx: API.Context, next: NextFunction) => {
    // only if path was register with newsletter param and it was successfull. Then we will put user in the mailing list.
    if (ctx.request.url === '/api/auth/local/register') {
      // we do NOT await this. it has nothing to with account creation and should not block it. just a side effect.
    }
    await next();
  };
};
