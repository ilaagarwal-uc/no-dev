OUTPUT_PATH = '/tmp/7d0d8160-5188-435a-832e-c2d2d2b16c70.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on the provided image dimensions.
    Dimensions used (in feet):
    - Total Wall Height: 9'
    - Door/AC Opening Width: 7'
    - Door/AC Opening Height: 8'
    - Remaining Wall Width (Right): 7'6" (7.5')
    - Total Wall Width: 14'6" (14.5')
    """
    
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Define wall thickness (standard architectural representation)
    thickness = 0.5
    
    # 1. Create the Right Wall Section
    # Dimensions: Width=7.5', Height=9', Depth=0.5'
    # Position: The section starts at x=7 and ends at x=14.5. 
    # Center X = 7 + (7.5 / 2) = 10.75
    # Center Z = 9 / 2 = 4.5
    bpy.ops.mesh.primitive_cube_add(size=1, location=(10.75, 0, 4.5))
    wall_right = bpy.context.active_object
    wall_right.scale = (7.5, thickness, 9)
    wall_right.name = "Wall_Section_Right"

    # 2. Create the Top Wall Section (Lintel above the door/AC opening)
    # Dimensions: Width=7', Height=1', Depth=0.5'
    # Position: The section starts at x=0 and ends at x=7.
    # Center X = 7 / 2 = 3.5
    # Position: The section starts at z=8 and ends at z=9.
    # Center Z = 8 + (1 / 2) = 8.5
    bpy.ops.mesh.primitive_cube_add(size=1, location=(3.5, 0, 8.5))
    wall_top = bpy.context.active_object
    wall_top.scale = (7, thickness, 1)
    wall_top.name = "Wall_Section_Top_Left"

    # Export the entire scene to a GLB file
    # use_selection=False ensures all created objects are included
    bpy.ops.export_scene.gltf(
        filepath='/tmp/7d0d8160-5188-435a-832e-c2d2d2b16c70.glb', 
        export_format='GLB', 
        use_selection=False
    )

# Execute the function directly for headless Blender environments
create_wall_skeleton()