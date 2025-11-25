/**
 * Exercise Commands - Lote 7
 * Command objects for Exercise write operations
 */

class CreateExerciseCommand {
  constructor({ exerciseName, muscularGroup, description, equipmentNeeded, difficulty, instructions, videoUrl, createdBy }) {
    this.exerciseName = exerciseName;
    this.muscularGroup = muscularGroup;
    this.description = description;
    this.equipmentNeeded = equipmentNeeded;
    this.difficulty = difficulty;
    this.instructions = instructions;
    this.videoUrl = videoUrl;
    this.createdBy = createdBy;
  }
}

class UpdateExerciseCommand {
  constructor({ idExercise, exerciseName, muscularGroup, description, equipmentNeeded, difficulty, instructions, videoUrl }) {
    this.idExercise = idExercise;
    this.exerciseName = exerciseName;
    this.muscularGroup = muscularGroup;
    this.description = description;
    this.equipmentNeeded = equipmentNeeded;
    this.difficulty = difficulty;
    this.instructions = instructions;
    this.videoUrl = videoUrl;
  }
}

class DeleteExerciseCommand {
  constructor({ idExercise }) {
    this.idExercise = idExercise;
  }
}

module.exports = {
  CreateExerciseCommand,
  UpdateExerciseCommand,
  DeleteExerciseCommand
};
