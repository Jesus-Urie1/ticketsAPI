import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const users = [
  // This is a mock data, normally you'll fetch users from a database.
  {
    user: "admin",
    password: await bcrypt.hash("AdH51*min", 10),
  },
];

export const login = async (req, res) => {
  const { user, password } = req.body;

  const userFound = users.find((u) => u.user === user);
  if (!userFound)
    return res
      .status(401)
      .json({ message: "Usuario y/o contraseña invalidos" });

  const isPasswordValid = await bcrypt.compare(password, userFound.password);
  if (!isPasswordValid)
    return res
      .status(401)
      .json({ message: "Usuario y/o contraseña invalidos" });

  // Generate JWT Token
  const token = jwt.sign({ user: userFound.user }, process.env.JWT_SECRET, {
    expiresIn: "4h",
  });

  return res.status(200).json({ token });
};
