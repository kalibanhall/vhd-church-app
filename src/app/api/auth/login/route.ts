import { NextRequest, NextResponse } from 'next/server'import { NextRequest, NextResponse } from 'next/server'import { NextRequest, NextResponse } from 'next/server';// SOLUTION TEMPORAIRE : API login avec utilisateurs en dur (mode dégradé)// SOLUTION TEMPORAIRE : Redirection vers fallback en attendant fix DB



export async function POST(request: NextRequest) {import bcrypt from 'bcryptjs'

  try {

    const { email, password } = await request.json()import jwt from 'jsonwebtoken'import bcrypt from 'bcryptjs';



    // Mode dégradé - utilisateur admin temporaire

    if (email === 'admin@vhd.app' && password === 'Qualis@2025') {

      const response = NextResponse.json({export async function POST(request: NextRequest) {import jwt from 'jsonwebtoken';import { NextRequest, NextResponse } from 'next/server';import { NextRequest, NextResponse } from 'next/server';

        success: true,

        message: 'Connexion réussie (mode dégradé)',  try {

        user: {

          id: 'admin-temp',    const { email, password } = await request.json()

          email: 'admin@vhd.app', 

          firstName: 'Chris',

          lastName: 'Kasongo',

          role: 'ADMIN',    // Utilisateur admin temporaireconst JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';import bcrypt from 'bcryptjs';import bcrypt from 'bcryptjs';

          status: 'ACTIVE'

        }    if (email === 'admin@vhd.app') {

      })

      const isValid = await bcrypt.compare(password, '$2a$12$5w7wbciIDhCiGtQubYCzN.TObWHHtrh4M3o9GJeM4Em2pxh4qEaKO')

      return response

    }      



    return NextResponse.json({      if (isValid) {const tempUsers = [import jwt from 'jsonwebtoken';import jwt from 'jsonwebtoken';

      success: false,

      error: 'Identifiants incorrects'        const token = jwt.sign(

    }, { status: 401 })

          { userId: 'admin-temp', email: 'admin@vhd.app', role: 'ADMIN' },  {

  } catch (error) {

    return NextResponse.json({          process.env.JWT_SECRET || 'secret',

      success: false,

      error: 'Erreur serveur'          { expiresIn: '7d' }    id: 'admin-chris-kasongo-temp',

    }, { status: 500 })

  }        )

}
    email: 'admin@vhd.app',

        const response = NextResponse.json({

          success: true,    passwordHash: '$2a$12$5w7wbciIDhCiGtQubYCzN.TObWHHtrh4M3o9GJeM4Em2pxh4qEaKO',const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

          message: 'Connexion réussie',

          user: {    firstName: 'Chris',

            id: 'admin-temp',

            email: 'admin@vhd.app',     lastName: 'Kasongo',

            firstName: 'Chris',

            lastName: 'Kasongo',    role: 'ADMIN',

            role: 'ADMIN'

          },    status: 'ACTIVE',// Utilisateurs temporaires avec hash corrects// Utilisateurs temporaires avec hash corrects

          token

        })    phone: '+243999999999'



        response.cookies.set('auth-token', token, {  }const tempUsers = [const tempUsers = [

          httpOnly: true,

          secure: process.env.NODE_ENV === 'production',];

          maxAge: 7 * 24 * 60 * 60,

          path: '/'  {  {

        })

export async function POST(request: NextRequest) {

        return response

      }  try {    id: 'admin-chris-kasongo-temp',    id: 'admin-chris-kasongo-temp',

    }

    const { email, password } = await request.json();

    return NextResponse.json({

      success: false,    email: 'admin@vhd.app',    email: 'admin@vhd.app',

      error: 'Identifiants incorrects'

    }, { status: 401 })    if (!email || !password) {



  } catch (error) {      return NextResponse.json({    passwordHash: '$2a$12$5w7wbciIDhCiGtQubYCzN.TObWHHtrh4M3o9GJeM4Em2pxh4qEaKO', // Qualis@2025    passwordHash: '$2a$12$5w7wbciIDhCiGtQubYCzN.TObWHHtrh4M3o9GJeM4Em2pxh4qEaKO', // Qualis@2025

    return NextResponse.json({

      success: false,        success: false,

      error: 'Erreur serveur'

    }, { status: 500 })        error: 'Email et mot de passe requis'    firstName: 'Chris',    firstName: 'Chris',

  }

}      }, { status: 400 });

    }    lastName: 'Kasongo',    lastName: 'Kasongo',



    const user = tempUsers.find(u => u.email.toLowerCase() === email.toLowerCase());    role: 'ADMIN',    role: 'ADMIN',

    

    if (!user) {    status: 'ACTIVE',    status: 'ACTIVE',

      return NextResponse.json({

        success: false,    phone: '+243999999999'    phone: '+243999999999'

        error: 'Utilisateur non trouvé'

      }, { status: 401 });  },  }

    }

  {];

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        id: 'demo-user-temp',

    if (!isValidPassword) {

      return NextResponse.json({    email: 'membre@vhd.app', export async function POST(request: NextRequest) {

        success: false,

        error: 'Mot de passe incorrect'    passwordHash: '$2a$12$V0qrbgwleamQpc4LRMNPTefG7.nV2wo.jeq0YUcTumhIxJya8Piwq', // Demo123!  try {

      }, { status: 401 });

    }    firstName: 'Demo',    const { email, password, rememberMe = false } = await request.json()



    const token = jwt.sign(    lastName: 'Membre', 

      {

        userId: user.id,    role: 'MEMBER',    // Vérifier si l'utilisateur existe

        email: user.email,

        role: user.role    status: 'ACTIVE',    const user = await prisma.user.findUnique({

      },

      JWT_SECRET,    phone: '+243888888888'      where: { email }

      { expiresIn: '7d' }

    );  }    })



    const { passwordHash, ...userWithoutPassword } = user;];



    const response = NextResponse.json({    if (!user) {

      success: true,

      message: 'Connexion réussie (mode dégradé)',export async function POST(request: NextRequest) {      return NextResponse.json(

      user: userWithoutPassword,

      token,  try {        { error: 'Utilisateur non trouvé' },

      fallback: true

    });    const { email, password } = await request.json();        { status: 401 }



    response.cookies.set('auth-token', token, {      )

      httpOnly: true,

      secure: process.env.NODE_ENV === 'production',    if (!email || !password) {    }

      sameSite: 'lax',

      maxAge: 7 * 24 * 60 * 60,      return NextResponse.json({

      path: '/'

    });        success: false,    // Vérifier le mot de passe



    return response;        error: 'Email et mot de passe requis'    const isValidPassword = await bcrypt.compare(password, user.passwordHash)



  } catch (error: any) {      }, { status: 400 });

    console.error('❌ Erreur login:', error);

        }    if (!isValidPassword) {

    return NextResponse.json({

      success: false,      return NextResponse.json(

      error: 'Erreur interne du serveur',

      details: error.message    console.log('🔍 Tentative connexion:', email);        { error: 'Mot de passe incorrect' },

    }, { status: 500 });

  }        { status: 401 }

}
    // Rechercher l'utilisateur      )

    const user = tempUsers.find(u => u.email.toLowerCase() === email.toLowerCase());    }

    

    if (!user) {    // Vérifier si le compte est actif ou en attente

      console.log('❌ Utilisateur non trouvé:', email);    if (user.status === 'INACTIVE' || user.status === 'BANNED') {

      return NextResponse.json({      return NextResponse.json(

        success: false,        { error: 'Compte désactivé ou suspendu' },

        error: 'Utilisateur non trouvé'        { status: 403 }

      }, { status: 401 });      )

    }    }



    console.log('✅ Utilisateur trouvé, vérification mot de passe...');    // Créer le token JWT avec durée variable selon "Se souvenir de moi"

    const expiresIn = rememberMe ? '30d' : '7d'

    // Vérifier le mot de passe    const token = jwt.sign(

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);      { 

            userId: user.id, 

    if (!isValidPassword) {        email: user.email, 

      console.log('❌ Mot de passe incorrect');        role: user.role 

      return NextResponse.json({      },

        success: false,      AUTH_CONFIG.jwt.secret as string,

        error: 'Mot de passe incorrect'      { expiresIn }

      }, { status: 401 });    )

    }

    // Retourner les données utilisateur (sans le mot de passe)

    console.log('✅ Authentification réussie, création du token...');    const { passwordHash, ...userWithoutPassword } = user



    // Créer le token JWT    // Créer la réponse avec le cookie sécurisé

    const token = jwt.sign(    const response = NextResponse.json({

      {      success: true,

        userId: user.id,      message: 'Connexion réussie',

        email: user.email,      user: userWithoutPassword

        role: user.role    })

      },

      JWT_SECRET,    return setAuthCookie(response, token, rememberMe)

      { expiresIn: '7d' }

    );  } catch (error: any) {

    console.error('Erreur de connexion:', error)

    // Préparer les données utilisateur (sans le mot de passe)    return NextResponse.json(

    const { passwordHash, ...userWithoutPassword } = user;      { 

        error: 'Erreur interne du serveur',

    // Créer la réponse avec cookie sécurisé        details: error.message || 'Erreur inconnue',

    const response = NextResponse.json({        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined

      success: true,      },

      message: 'Connexion réussie (mode dégradé)',      { status: 500 }

      user: userWithoutPassword,    )

      token,  }

      fallback: true}
    });

    // Définir le cookie d'authentification
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 jours
      path: '/'
    });

    console.log('✅ Connexion complète, token et cookie définis');

    return response;

  } catch (error: any) {
    console.error('❌ Erreur login:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erreur interne du serveur',
      details: error.message
    }, { status: 500 });
  }
}