/* -----------------------------------------------
/* Authors: wearrrrr
/* GNU General Public License v3.0: https://www.gnu.org/licenses/gpl-3.0.en.html
/* Workerware Error Script
/* ----------------------------------------------- */

class WWError extends Error {
  constructor(message) {
    super(message);
    this.name = '[WorkerWare Exception]';
  }
}
