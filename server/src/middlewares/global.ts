import { NextFunction } from 'connect';

export default () => {
  return async (ctx: API.Context, next: NextFunction) => {
    // only if path was register with newsletter param and it was successfull. Then we will put user in the mailing list.

    return next();
  };
};
