const {
  toAssistance,
  toAssistances,
  toPaginatedAssistances,
} = require('../../../infra/db/mappers/assistance.mapper');

describe('assistance-mapper toAssistance', () => {
  it('transforma una asistencia completa sin relaciones', () => {
    const assistanceInstance = {
      get: () => ({
        id_assistance: 1,
        id_user_profile: 10,
        id_gym: 5,
        date: '2024-01-15',
        check_in_time: '08:30:00',
        check_out_time: '10:00:00',
        duration_minutes: 90,
        auto_checkin: false,
        distance_meters: 25.5,
        verified: true,
        created_at: '2024-01-15T08:30:00.000Z',
      }),
    };

    const result = toAssistance(assistanceInstance);

    expect(result.id_assistance).toBe(1);
    expect(result.id_user_profile).toBe(10);
    expect(result.id_gym).toBe(5);
    expect(result.date).toBe('2024-01-15');
    expect(result.check_in_time).toBe('08:30:00');
    expect(result.check_out_time).toBe('10:00:00');
    expect(result.duration_minutes).toBe(90);
    expect(result.auto_checkin).toBe(false);
    expect(result.distance_meters).toBe(25.5);
    expect(result.verified).toBe(true);
    expect(result.created_at).toBe('2024-01-15T08:30:00.000Z');
  });

  it('transforma una asistencia con relación gym', () => {
    const assistanceInstance = {
      get: () => ({
        id_assistance: 2,
        id_user_profile: 10,
        id_gym: 5,
        date: '2024-01-15',
        check_in_time: '08:30:00',
        check_out_time: null,
        duration_minutes: null,
        auto_checkin: false,
        distance_meters: 30.0,
        verified: false,
        created_at: '2024-01-15T08:30:00.000Z',
        gym: {
          id_gym: 5,
          name: 'Gym Central',
          city: 'Buenos Aires',
          address: 'Av. Corrientes 1234',
          latitude: -34.6037,
          longitude: -58.3816,
        },
      }),
    };

    const result = toAssistance(assistanceInstance);

    expect(result.id_assistance).toBe(2);
    expect(result.gym).toEqual({
      id_gym: 5,
      name: 'Gym Central',
      city: 'Buenos Aires',
      address: 'Av. Corrientes 1234',
      latitude: -34.6037,
      longitude: -58.3816,
    });
  });

  it('transforma una asistencia con relación userProfile', () => {
    const assistanceInstance = {
      get: () => ({
        id_assistance: 3,
        id_user_profile: 10,
        id_gym: 5,
        date: '2024-01-15',
        check_in_time: '08:30:00',
        check_out_time: null,
        duration_minutes: null,
        auto_checkin: true,
        distance_meters: 15.0,
        verified: false,
        created_at: '2024-01-15T08:30:00.000Z',
        userProfile: {
          id_user_profile: 10,
          full_name: 'John Doe',
          username: 'johndoe',
        },
      }),
    };

    const result = toAssistance(assistanceInstance);

    expect(result.id_assistance).toBe(3);
    expect(result.auto_checkin).toBe(true);
    expect(result.userProfile).toEqual({
      id_user_profile: 10,
      full_name: 'John Doe',
      username: 'johndoe',
    });
  });

  it('transforma una asistencia con ambas relaciones (gym y userProfile)', () => {
    const assistanceInstance = {
      get: () => ({
        id_assistance: 4,
        id_user_profile: 10,
        id_gym: 5,
        date: '2024-01-15',
        check_in_time: '08:30:00',
        check_out_time: '09:30:00',
        duration_minutes: 60,
        auto_checkin: false,
        distance_meters: 20.0,
        verified: true,
        created_at: '2024-01-15T08:30:00.000Z',
        gym: {
          id_gym: 5,
          name: 'Gym North',
          city: 'Rosario',
          address: 'San Martín 500',
          latitude: -32.9442,
          longitude: -60.6505,
        },
        userProfile: {
          id_user_profile: 10,
          full_name: 'Jane Smith',
          username: 'janesmith',
        },
      }),
    };

    const result = toAssistance(assistanceInstance);

    expect(result.id_assistance).toBe(4);
    expect(result.gym).toBeDefined();
    expect(result.gym.name).toBe('Gym North');
    expect(result.userProfile).toBeDefined();
    expect(result.userProfile.full_name).toBe('Jane Smith');
  });

  it('maneja asistencia con auto_checkin true', () => {
    const assistanceInstance = {
      get: () => ({
        id_assistance: 5,
        id_user_profile: 10,
        id_gym: 5,
        date: '2024-01-15',
        check_in_time: '08:30:00',
        check_out_time: null,
        duration_minutes: null,
        auto_checkin: true,
        distance_meters: 10.5,
        verified: false,
        created_at: '2024-01-15T08:30:00.000Z',
      }),
    };

    const result = toAssistance(assistanceInstance);

    expect(result.auto_checkin).toBe(true);
    expect(result.distance_meters).toBe(10.5);
  });

  it('maneja campos opcionales null (check_out_time, duration_minutes)', () => {
    const assistanceInstance = {
      get: () => ({
        id_assistance: 6,
        id_user_profile: 10,
        id_gym: 5,
        date: '2024-01-15',
        check_in_time: '08:30:00',
        check_out_time: null,
        duration_minutes: null,
        auto_checkin: false,
        distance_meters: null,
        verified: false,
        created_at: '2024-01-15T08:30:00.000Z',
      }),
    };

    const result = toAssistance(assistanceInstance);

    expect(result.check_out_time).toBeNull();
    expect(result.duration_minutes).toBeNull();
    expect(result.distance_meters).toBeNull();
  });

  it('retorna null cuando model es null', () => {
    const result = toAssistance(null);

    expect(result).toBeNull();
  });

  it('retorna null cuando model es undefined', () => {
    const result = toAssistance(undefined);

    expect(result).toBeNull();
  });

  it('maneja un objeto plano sin método get()', () => {
    const plainAssistance = {
      id_assistance: 7,
      id_user_profile: 10,
      id_gym: 5,
      date: '2024-01-15',
      check_in_time: '08:30:00',
      check_out_time: null,
      duration_minutes: null,
      auto_checkin: false,
      distance_meters: 25.0,
      verified: false,
      created_at: '2024-01-15T08:30:00.000Z',
    };

    const result = toAssistance(plainAssistance);

    expect(result.id_assistance).toBe(7);
    expect(result.id_user_profile).toBe(10);
    expect(result.date).toBe('2024-01-15');
  });

  it('no incluye gym si no está presente', () => {
    const assistanceInstance = {
      get: () => ({
        id_assistance: 8,
        id_user_profile: 10,
        id_gym: 5,
        date: '2024-01-15',
        check_in_time: '08:30:00',
        check_out_time: null,
        duration_minutes: null,
        auto_checkin: false,
        distance_meters: 30.0,
        verified: false,
        created_at: '2024-01-15T08:30:00.000Z',
      }),
    };

    const result = toAssistance(assistanceInstance);

    expect(result.gym).toBeUndefined();
  });

  it('no incluye userProfile si no está presente', () => {
    const assistanceInstance = {
      get: () => ({
        id_assistance: 9,
        id_user_profile: 10,
        id_gym: 5,
        date: '2024-01-15',
        check_in_time: '08:30:00',
        check_out_time: null,
        duration_minutes: null,
        auto_checkin: false,
        distance_meters: 30.0,
        verified: false,
        created_at: '2024-01-15T08:30:00.000Z',
      }),
    };

    const result = toAssistance(assistanceInstance);

    expect(result.userProfile).toBeUndefined();
  });
});

describe('assistance-mapper toAssistances', () => {
  it('transforma un array de asistencias', () => {
    const assistances = [
      {
        get: () => ({
          id_assistance: 1,
          id_user_profile: 10,
          id_gym: 5,
          date: '2024-01-15',
          check_in_time: '08:30:00',
          check_out_time: null,
          duration_minutes: null,
          auto_checkin: false,
          distance_meters: 25.0,
          verified: false,
          created_at: '2024-01-15T08:30:00.000Z',
        }),
      },
      {
        get: () => ({
          id_assistance: 2,
          id_user_profile: 10,
          id_gym: 5,
          date: '2024-01-16',
          check_in_time: '09:00:00',
          check_out_time: null,
          duration_minutes: null,
          auto_checkin: true,
          distance_meters: 15.0,
          verified: false,
          created_at: '2024-01-16T09:00:00.000Z',
        }),
      },
    ];

    const result = toAssistances(assistances);

    expect(result).toHaveLength(2);
    expect(result[0].id_assistance).toBe(1);
    expect(result[1].id_assistance).toBe(2);
    expect(result[1].auto_checkin).toBe(true);
  });

  it('retorna array vacío cuando el input no es un array', () => {
    const result = toAssistances(null);

    expect(result).toEqual([]);
  });

  it('retorna array vacío para array vacío', () => {
    const result = toAssistances([]);

    expect(result).toEqual([]);
  });

  it('filtra elementos null del array', () => {
    const assistances = [
      {
        get: () => ({
          id_assistance: 1,
          id_user_profile: 10,
          id_gym: 5,
          date: '2024-01-15',
          check_in_time: '08:30:00',
          check_out_time: null,
          duration_minutes: null,
          auto_checkin: false,
          distance_meters: 25.0,
          verified: false,
          created_at: '2024-01-15T08:30:00.000Z',
        }),
      },
      null,
      {
        get: () => ({
          id_assistance: 2,
          id_user_profile: 10,
          id_gym: 5,
          date: '2024-01-16',
          check_in_time: '09:00:00',
          check_out_time: null,
          duration_minutes: null,
          auto_checkin: false,
          distance_meters: 20.0,
          verified: false,
          created_at: '2024-01-16T09:00:00.000Z',
        }),
      },
    ];

    const result = toAssistances(assistances);

    expect(result).toHaveLength(3);
    expect(result[0].id_assistance).toBe(1);
    expect(result[1]).toBeNull();
    expect(result[2].id_assistance).toBe(2);
  });
});

describe('assistance-mapper toPaginatedAssistances', () => {
  it('transforma resultado paginado completo', () => {
    const paginatedResult = {
      rows: [
        {
          get: () => ({
            id_assistance: 1,
            id_user_profile: 10,
            id_gym: 5,
            date: '2024-01-15',
            check_in_time: '08:30:00',
            check_out_time: null,
            duration_minutes: null,
            auto_checkin: false,
            distance_meters: 25.0,
            verified: false,
            created_at: '2024-01-15T08:30:00.000Z',
          }),
        },
        {
          get: () => ({
            id_assistance: 2,
            id_user_profile: 10,
            id_gym: 5,
            date: '2024-01-16',
            check_in_time: '09:00:00',
            check_out_time: null,
            duration_minutes: null,
            auto_checkin: true,
            distance_meters: 15.0,
            verified: false,
            created_at: '2024-01-16T09:00:00.000Z',
          }),
        },
      ],
      count: 25,
    };

    const result = toPaginatedAssistances(paginatedResult);

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(25);
    expect(result.items[0].id_assistance).toBe(1);
    expect(result.items[1].id_assistance).toBe(2);
  });

  it('maneja resultado sin rows (array vacío)', () => {
    const paginatedResult = {
      rows: [],
      count: 0,
    };

    const result = toPaginatedAssistances(paginatedResult);

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('maneja resultado con rows null', () => {
    const paginatedResult = {
      rows: null,
      count: 0,
    };

    const result = toPaginatedAssistances(paginatedResult);

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('maneja resultado con count null', () => {
    const paginatedResult = {
      rows: [
        {
          get: () => ({
            id_assistance: 1,
            id_user_profile: 10,
            id_gym: 5,
            date: '2024-01-15',
            check_in_time: '08:30:00',
            check_out_time: null,
            duration_minutes: null,
            auto_checkin: false,
            distance_meters: 25.0,
            verified: false,
            created_at: '2024-01-15T08:30:00.000Z',
          }),
        },
      ],
      count: null,
    };

    const result = toPaginatedAssistances(paginatedResult);

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(0);
  });

  it('maneja resultado paginado con relaciones incluidas', () => {
    const paginatedResult = {
      rows: [
        {
          get: () => ({
            id_assistance: 1,
            id_user_profile: 10,
            id_gym: 5,
            date: '2024-01-15',
            check_in_time: '08:30:00',
            check_out_time: null,
            duration_minutes: null,
            auto_checkin: false,
            distance_meters: 25.0,
            verified: false,
            created_at: '2024-01-15T08:30:00.000Z',
            gym: {
              id_gym: 5,
              name: 'Gym Central',
              city: 'Buenos Aires',
              address: 'Av. Corrientes 1234',
              latitude: -34.6037,
              longitude: -58.3816,
            },
          }),
        },
      ],
      count: 1,
    };

    const result = toPaginatedAssistances(paginatedResult);

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.items[0].gym).toBeDefined();
    expect(result.items[0].gym.name).toBe('Gym Central');
  });
});
