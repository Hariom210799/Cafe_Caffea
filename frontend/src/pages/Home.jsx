import React from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";
import { motion } from "framer-motion";

import burgerImg from "../assets/burger.jpg";
import mojitoImg from "../assets/mojito.jpg";
import lavaCakeImg from "../assets/lava_cake.jpg";
import cafeInterior from "../assets/cafe_interior.png"; // <- add a cinematic coffee-shop image here

const HomePage = () => {
  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #0d1f1c 0%, #1b3a34 100%)",
        color: "#f5e6c8",
        overflowX: "hidden",
      }}
    >
      {/* === HERO SECTION === */}
      <Box
        sx={{
          position: "relative",
          height: { xs: "80vh", md: "90vh" },
          backgroundImage: `url(${cafeInterior})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 2,
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(to bottom, rgba(13,31,28,0.6), rgba(27,58,52,0.9))",
          },
        }}
      >
        <Box position="relative" zIndex={2}>
          <Typography
            variant="h2"
            fontWeight="bold"
            sx={{
              mb: 2,
              fontFamily: "Poppins, sans-serif",
              letterSpacing: 1,
              color: "#f5e6c8",
            }}
          >
            Cafe Caffea
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              color: "#d6ad60",
              fontStyle: "italic",
            }}
          >
            “Bliss On a Plate.”
          </Typography>
          <Button
            variant="contained"
            href="/menu"
            sx={{
              backgroundColor: "#d6ad60",
              color: "#1b3a34",
              fontWeight: "bold",
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontSize: "1rem",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#c49a50",
              },
            }}
          >
            Explore Our Menu
          </Button>
          
        </Box>
      </Box>

      {/* === ABOUT SECTION === */}
      <Box sx={{ py: { xs: 8, md: 10 }, px: { xs: 3, md: 12 }, textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: "#d6ad60", mb: 2 }}
          >
            A Blend of Taste and Tranquility
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#f1e8d2",
              maxWidth: "800px",
              margin: "0 auto",
              lineHeight: 1.8,
            }}
          >
            At Cafe Caffea, every cup is crafted with warmth, every bite with
            love, and every moment with comfort. From our sizzling burgers to
            refreshing mojitos and decadent desserts, we bring a taste of joy to
            your table one delicious experience at a time.
          </Typography>
        </motion.div>
      </Box>

      {/* === SIGNATURE ITEMS === */}
      <Box sx={{ py: { xs: 8, md: 10 }, px: { xs: 3, md: 10 } }}>
        <Typography
          variant="h4"
          textAlign="center"
          fontWeight="bold"
          sx={{ mb: 6, color: "#d6ad60" }}
        >
          Our Signatures
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {[burgerImg, mojitoImg, lavaCakeImg].map((img, i) => {
            const titles = ["Cheese Burger", "Virgin Mojito", "Lava Cake"];
            const descs = [
              "Juicy grilled burger with cheese and crisp lettuce.",
              "Refreshing mint and lime mocktail served chilled.",
              "Rich chocolate dessert with molten lava center.",
            ];
            return (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card
                    sx={{
                      height: 380,
                      borderRadius: 5,
                      overflow: "hidden",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
                    }}
                  >
                    <Box
                      sx={{
                        height: 230,
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={img}
                        alt={titles[i]}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transform: "scale(1)",
                          transition:
                            "transform 0.6s ease, filter 0.6s ease",
                          "&:hover": {
                            transform: "scale(1.08)",
                            filter: "brightness(0.9)",
                          },
                        }}
                      />
                    </Box>
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ color: "#f5e6c8" }}
                      >
                        {titles[i]}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#d8d2be",
                          mt: 1,
                          height: 38,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {descs[i]}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* === CTA SECTION === */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          px: { xs: 3, md: 12 },
          textAlign: "center",
          background:
            "linear-gradient(135deg, rgba(27,58,52,0.95), rgba(13,31,28,0.95))",
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ color: "#d6ad60", mb: 2 }}
        >
          Ready to Taste the Magic?
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#f1e8d2",
            maxWidth: "600px",
            margin: "0 auto",
            mb: 4,
          }}
        >
          Visit us at Cafe Caffea for an unforgettable blend of taste and
          comfort or explore our menu online to order your favorites.
        </Typography>
        <Button
          variant="contained"
          href="/menu"
          sx={{
            backgroundColor: "#d6ad60",
            color: "#1b3a34",
            fontWeight: "bold",
            textTransform: "none",
            borderRadius: 3,
            px: 5,
            py: 1.5,
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            "&:hover": { backgroundColor: "#c49a50" },
          }}
        >
          Order Now
        </Button>
      </Box>

      {/* === FOOTER === */}
      <Box
        sx={{
          py: 3,
          textAlign: "center",
          backgroundColor: "#0d1f1c",
          color: "#d8d2be",
          fontSize: "0.9rem",
          letterSpacing: 0.5,
        }}
      >
        © {new Date().getFullYear()} Cafe Caffea - Bliss On a  Plate.
      </Box>
    </Box>
  );
};

export default HomePage;
