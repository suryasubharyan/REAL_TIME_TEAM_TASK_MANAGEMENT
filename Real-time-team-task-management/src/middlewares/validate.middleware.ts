import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

export const validateDTO = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dtoObject = plainToInstance(dtoClass, req.body);
      const errors = await validate(dtoObject, { whitelist: true, forbidNonWhitelisted: true });

      if (errors.length > 0) {
        const message = errors
          .map(err => Object.values(err.constraints || {}))
          .flat()
          .join(", ");
        return res.status(400).json({ success: false, message });
      }

      next();
    } catch (error: any) {
      console.error("Validation error:", error);
      return res.status(400).json({ success: false, message: error.message });
    }
  };
};
