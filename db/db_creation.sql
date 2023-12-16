SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema wildlife
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema wildlife
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `wildlife`;

CREATE SCHEMA IF NOT EXISTS `wildlife` DEFAULT CHARACTER SET utf8 ;
USE `wildlife` ;

-- -----------------------------------------------------
-- Table `wildlife`.`animal`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `wildlife`.`animal` (
  `animal_id` INT NOT NULL AUTO_INCREMENT,
  `animal_name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`animal_id`)
  )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `wildlife`.`location`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `wildlife`.`location` (
  `location_id` INT NOT NULL AUTO_INCREMENT,
  `country` VARCHAR(45) NULL,
  `state` VARCHAR(45) NULL,
  `city` VARCHAR(45) NULL,
  PRIMARY KEY (`location_id`)
  )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `wildlife`.`animal_location`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `wildlife`.`animal_location` (
  `animal_id` INT NOT NULL,
  `location_id` INT NOT NULL,
  `count` INT NULL,
  PRIMARY KEY (`animal_id`, `location_id`),
  CONSTRAINT `fk_animal_location_animal`
    FOREIGN KEY (`animal_id`)
    REFERENCES `wildlife`.`animal` (`animal_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_animal_location_location`
    FOREIGN KEY (`location_id`)
    REFERENCES `wildlife`.`location` (`location_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;


INSERT INTO `wildlife`.`animal` (animal_name) VALUES ('deer');
INSERT INTO `wildlife`.`animal` (animal_name) VALUES ('squirrel');
INSERT INTO `wildlife`.`animal` (animal_name) VALUES ('raccoon');
INSERT INTO `wildlife`.`animal` (animal_name) VALUES ('opossum');
INSERT INTO `wildlife`.`animal` (animal_name) VALUES ('bobcat');

INSERT INTO `wildlife`.`location` (country, state, city) VALUES ('US', 'Iowa', 'Fairfield');
INSERT INTO `wildlife`.`location` (country, state, city) VALUES ('US', 'Illinois', 'Chicago');
INSERT INTO `wildlife`.`location` (country, state, city) VALUES ('US', 'New York', 'New York City');
INSERT INTO `wildlife`.`location` (country, state, city) VALUES ('US', 'Florida', 'Jacksonville');
